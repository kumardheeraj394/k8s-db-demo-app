# Single Node Kubernetes Installation with ArgoCD and MetalLB

## Index
1. [System Preparation](#1-system-preparation)  
2. [Install Kubernetes Binaries](#2-install-kubernetes-binaries)  
3. [Install Container Runtime (containerd)](#3-install-container-runtime-containerd)  
4. [Enable Kernel Modules and Sysctl](#4-enable-kernel-modules-and-sysctl)  
5. [Initialize Kubernetes Cluster](#5-initialize-kubernetes-cluster)  
6. [Install Calico CNI](#6-install-calico-cni)  
7. [Install MetalLB Load Balancer](#7-install-metallb-load-balancer)  
8. [Install ArgoCD](#8-install-argocd)  
9. [Expose ArgoCD UI with LoadBalancer](#9-expose-argocd-ui-with-loadbalancer)  
10. [Retrieve ArgoCD Admin Password](#10-retrieve-argocd-admin-password)  

---

## 1. System Preparation

Update the system packages and prepare it for Kubernetes installation.

```bash
sudo dnf update -y
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing/SELINUX=permissive/' /etc/selinux/config
sudo swapoff -a
sudo sed -i '/swap/d' /etc/fstab
```

- **Disable SELinux enforcement:** Kubernetes requires SELinux to be permissive or disabled for proper operation.
- **Turn off swap:** Kubernetes needs swap disabled to function properly.
- **Remove swap from fstab:** Prevent swap from enabling after reboot.

---

## 2. Install Kubernetes Binaries

Add Kubernetes repo and install required binaries: kubelet, kubeadm, and kubectl.

```bash
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.29/rpm/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.29/rpm/repodata/repomd.xml.key
EOF

sudo dnf install -y kubelet kubeadm kubectl
sudo systemctl enable --now kubelet
```

- **kubelet:** The Kubernetes node agent that runs on every node.
- **kubeadm:** Tool to bootstrap the Kubernetes cluster.
- **kubectl:** Command-line tool to interact with the cluster.
- Enable kubelet service to start at boot.

---

## 3. Install Container Runtime (containerd)

Container runtime is needed to run containers. We'll install containerd.

```bash
wget https://github.com/containerd/containerd/releases/download/v1.7.15/containerd-1.7.15-linux-amd64.tar.gz
sudo tar Cxzvf /usr/local containerd-1.7.15-linux-amd64.tar.gz

sudo tee /etc/systemd/system/containerd.service > /dev/null <<EOF
[Unit]
Description=containerd container runtime
After=network.target

[Service]
ExecStart=/usr/local/bin/containerd
Restart=always
RestartSec=5
Delegate=yes
KillMode=process
OOMScoreAdjust=-999
LimitNOFILE=1048576
LimitNPROC=infinity
LimitCORE=infinity

[Install]
WantedBy=multi-user.target
EOF

sudo mkdir -p /etc/containerd
sudo /usr/local/bin/containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable --now containerd
```

- Downloads and installs containerd binaries.
- Creates and enables the containerd systemd service.
- Configures containerd to use systemd cgroup driver, which is recommended for Kubernetes.

---

## 4. Enable Kernel Modules and Sysctl

Enable kernel modules and apply sysctl settings required for Kubernetes networking.

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1
EOF

sudo modprobe overlay
sudo modprobe br_netfilter
sudo sysctl --system
```

- Loads kernel modules: `overlay` and `br_netfilter`.
- Configures sysctl settings for packet forwarding and bridging required by Kubernetes networking.

---

## 5. Initialize Kubernetes Cluster

Initialize the Kubernetes control plane with a pod network CIDR.

```bash
sudo kubeadm init --pod-network-cidr=192.168.0.0/16
```

After initialization:

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```

- Initializes the Kubernetes cluster.
- Copies admin kubeconfig for `kubectl` usage.
- Removes master node taint to allow scheduling pods on control-plane node (for single node cluster).

---

## 6. Install Calico CNI

Install Calico, a popular network plugin, to enable pod networking.

```bash
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/calico.yaml
```

- Calico handles network policies and communication between pods.

---

## 7. Install MetalLB Load Balancer

MetalLB provides LoadBalancer support on bare-metal or single node clusters.

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.7/config/manifests/metallb-native.yaml
```

Create MetalLB IP address pool and advertise:

```bash
cat <<EOF | tee metallb-config.yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default-address-pool
  namespace: metallb-system
spec:
  addresses:
  - 10.10.37.240-10.10.37.250
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: l2-advertisement
  namespace: metallb-system
EOF

kubectl apply -f metallb-config.yaml
```

- Configures MetalLB to assign IPs from `10.10.37.240-10.10.37.250` range.
- Enables Layer 2 advertisement so the IPs are reachable.

---

## 8. Install ArgoCD

ArgoCD is a GitOps continuous delivery tool for Kubernetes.

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

- Creates the `argocd` namespace.
- Installs ArgoCD components.

---

## 9. Expose ArgoCD UI with LoadBalancer

Edit ArgoCD server service to expose it via LoadBalancer:

```bash
kubectl -n argocd edit svc argocd-server
```

Change:

```yaml
type: ClusterIP
```

to

```yaml
type: LoadBalancer
```

- This change exposes ArgoCD UI externally using MetalLB LoadBalancer IP.

---

## 10. Retrieve ArgoCD Admin Password

Get the initial admin password to log in to ArgoCD UI:

```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d && echo
```

- Prints the admin password stored in Kubernetes secret.

---

# Notes

- This guide assumes a CentOS/RHEL 8+ environment.
- IP ranges (e.g., MetalLB IP pool) must be adjusted to your network.
- Use `kubectl get svc -n argocd` to find the external IP assigned to ArgoCD.
- After logging in to ArgoCD UI, it is recommended to change the default password.
