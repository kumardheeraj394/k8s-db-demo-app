
# Kubernetes Learning Path

A comprehensive guide to learning Kubernetes from basics to advanced concepts, including installation, core concepts, application deployment, networking, storage, security, and real-world projects.

---

## Contents

1. Basics & Core Concepts  
2. Kubernetes Installation & Setup  
3. Pods, ReplicaSets, Deployments.readiness probe  
4. Services & Networking  
5. Config & Secrets Management  
6. Volumes & Storage
7. ResourceQuota
8. Stateful Applications
9. DaemonSet
10. Multicontainer Pod and InitContainer  
    9.1 Multicontainer  
        9.1.1 Sidecar Pattern  
        9.1.2 Adapter Pattern  
        9.1.3 Ambassador Pattern  
    9.2 InitContainer 
11. StaticPod 
12. Job & CronJobs  
13. Helm (Package Manager)  
14. Security & RBAC
15. Kubernetes Affinity Cheat Sheet (YAML Example)
16. Observability: Logging & Monitoring  
17. CI/CD Integration  
18. Advanced Topics  
19. Real World Scenarios / Projects  

---

## 1. Basics & Core Concepts

### What is Kubernetes?  
An open-source container orchestration platform for automating deployment, scaling, and management of containerized applications.

### Why use Kubernetes?  
Benefits include scalability, self-healing, automated rollouts, and easy management of containerized applications.

### Kubernetes Architecture

**Master Components:**  
- **API Server:** Frontend for the Kubernetes control plane; validates and configures API objects.  
- **Controller Manager:** Runs controllers to ensure the desired state matches actual state.  
- **Scheduler:** Assigns pods to nodes based on resource availability and policies.  
- **etcd:** Distributed key-value store for cluster data persistence.

**Node Components:**  
- **Kubelet:** Agent on each node managing pod lifecycle.  
- **Kube-proxy:** Network proxy/load balancer on each node.  
- **Container Runtime:** Runs containers (Docker, containerd, CRI-O).

```
+-------------------+             +--------------------+
|      Master       |             |       Node         |
| +---------------+ |             | +----------------+ |
| | API Server    |<------------->|  Kubelet       | |
| +---------------+ |             | +----------------+ |
| | Controller    | |             | | Kube-proxy     | |
| | Manager       | |             | +----------------+ |
| | Scheduler     | |             | | Container      | |
| +---------------+ |             | | Runtime        | |
| | etcd          | |             | +----------------+ |
+-------------------+             +--------------------+
```

---

## 2. Kubernetes Installation & Setup

- Minikube (local single-node cluster)  
- kubeadm (manual multi-node cluster setup)  
- Managed Kubernetes (AWS EKS, Google GKE, Azure AKS)  
- kubectl CLI tool  
- Kubernetes Dashboard UI  

---

## 3. Pods, ReplicaSets, Deployments, Readiness probe

- **Pods:** Smallest deployable unit; can contain multiple containers.  
- **Pod Lifecycle:** Pending → Running → Succeeded / Failed → Unknown  

Example commands:  
```bash
kubectl get pods --all-namespaces -o wide  
kubectl describe pod <pod-name> -n <namespace>  
kubectl logs <pod-name> -n <namespace>
```

- **ReplicaSet & Self-healing:** Ensures desired number of pod replicas are running, replaces failed pods automatically.  
- **Deployment Object:** Manages ReplicaSets and provides declarative updates, supports rolling updates and rollbacks.

  # 📘 Kubernetes Readiness Probes

## ✅ What is a Readiness Probe?

A **readiness probe** tells Kubernetes **when a container is ready to accept traffic**. This ensures traffic is only routed to containers that are fully initialized and ready to serve.

---

## 🧠 Why Use Readiness Probes?

- Prevent routing traffic to pods that are not yet ready (e.g., still initializing).
- If the probe fails, the pod is removed from the **Service endpoint** list temporarily.
- It improves reliability and prevents application errors during startup.

---

## 🔍 Types of Readiness Probes

| Type        | Description                                              |
|-------------|----------------------------------------------------------|
| `httpGet`   | Performs an HTTP GET request to a specified path/port.   |
| `tcpSocket` | Opens a TCP connection to a specified port.              |
| `exec`      | Executes a command inside the container and checks result.|

---

## 🧪 Example (HTTP Readiness Probe)

```yaml
readinessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
```
---
# 📦 Kubernetes Deployment with Readiness Probe

This document provides an example of a Kubernetes `Deployment` configuration that uses an HTTP readiness probe to determine when the application is ready to receive traffic.

---

## ✅ Purpose of Readiness Probe

The readiness probe ensures that the application pod is only added to the service endpoints when it is fully ready to handle requests. If the readiness check fails, Kubernetes will not route traffic to that pod.

---

## 📄 Example Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
  labels:
    app: myapp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp-container
        image: kumardheeraj394/myapp:latest   # Replace with your Docker image
        ports:
        - containerPort: 8080
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
```
---
## 🔍 Explanation

- **replicas**: 2 pods will be created for high availability.

- **readinessProbe**:
  - **httpGet**: Probes the `/ready` path to check if the application is ready.
  - **port**: Uses container port `8080` to perform the check.
  - **initialDelaySeconds**: Kubernetes waits for 5 seconds after the container starts before performing the first readiness check.
  - **periodSeconds**: The readiness probe runs every 10 seconds to monitor the container's readiness.


---

## 4. Services & Networking

- **What is a Kubernetes Service?**  
  Provides stable network endpoints to access Pods, which have dynamic IPs.

| Type         | Description                                         |
|--------------|-----------------------------------------------------|
| ClusterIP    | Internal IP accessible only within cluster (default). |
| NodePort     | Exposes service on a static port on each Node.      |
| LoadBalancer | Creates external load balancer in supported clouds. |
| ExternalName | Maps service to external DNS name.                   |
---

- **DNS & CoreDNS:** Provides service discovery inside the cluster.  
- **Headless Service:** No cluster IP, used for direct pod access (e.g., StatefulSets).  
- **Ingress & Network Policies:** Manage external access and network traffic rules.

# 🌐 Ingress in Kubernetes

## ✅ What is Ingress?

An **Ingress** is a Kubernetes **API object** that manages **external HTTP and HTTPS access** to services within a cluster.

Ingress allows:
- 🌐 **Host-based routing** (e.g., `api.example.com`, `blog.example.com`)
- 📁 **Path-based routing** (e.g., `/login`, `/blog`)
- ⚖️ **Load balancing**
- 🔐 **SSL/TLS termination**

---

## ⚙️ How Ingress Works

To use Ingress, you must deploy an **Ingress Controller** inside your Kubernetes cluster.

### 🔄 Ingress Workflow

Client--> Domain (DNS)-->Ingress Controller (e.g., NGINX, Istio)-->Ingress Resource (routing rules)-->Kubernetes Service-->Deployment (Pods)-->Access the application



---

## 🧠 What is an Ingress Controller?

- An Ingress Controller is the **brain** behind Ingress.
- It **interprets the Ingress resources** and handles **actual routing** based on the rules.
- Without an Ingress Controller, Ingress resources do **nothing**.

---

## 🔧 Popular Ingress Controllers

- **NGINX** – most widely used, simple and stable
- **HAProxy**
- **Istio Ingress Gateway** – advanced, part of service mesh
- **Citrix**
- **Voyager**

> ✨ You can only run **one active ingress controller per resource class**, but you can run **multiple controllers** in the same cluster.

---

## 📄 Example: Ingress Resource YAML

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /app
        pathType: Prefix
        backend:
          service:
            name: my-app-service
            port:
              number: 80
```

---

🧠 Summary
Ingress provides external access to services using HTTP/HTTPS.

Needs an Ingress Controller to function.

Ingress Resource defines routing rules.

Common use cases:

Hosting multiple apps on a single IP

Managing SSL/TLS certificates

Controlled access and load balancing


  

---

## 5. Config & Secrets Management

- **ConfigMaps:** Store non-sensitive config data as key-value pairs.  
- **Secrets:** Store sensitive info securely (passwords, tokens).  
- Inject as environment variables or mounted files.  
- Volume mounting for configuration files inside containers.

---

## 6. Volumes & Storage

- **EmptyDir:** Temporary pod-local storage.  
- **HostPath:** Mount node filesystem into pod (use carefully).  
- **Persistent Volumes (PV):** Cluster-wide storage resources.  
- **Persistent Volume Claims (PVC):** User requests for storage.  
- **StorageClasses:** Define different storage types and provisioners.  
- **Dynamic Provisioning:** Auto-creates PVs when PVCs are made.

---

# 📦 Kubernetes Storage Concepts Guide

# 📁 emptyDir

### 📘 Definition  
A temporary directory that **exists as long as the Pod is running**. It's deleted when the Pod is removed.

### 🔧 Use Case  
- Scratch space for processing data  
- Sharing files between containers in the same Pod

### 📄 Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: emptydir-example
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "echo Hello > /data/hello.txt && sleep 3600"]
    volumeMounts:
    - name: temp-storage
      mountPath: /data
  volumes:
  - name: temp-storage
    emptyDir: {}


---

```
# 📁 hostPath

### 📘 Definition  
Mounts a file or directory **from the host node’s filesystem** into the Pod.
⚠️ **Warning**: Can compromise node security if misused. Use mainly for debugging or node-level access.


### 🔧 Use Case  
- Accessing system logs   
- Accessing hardware or system-level files

 
---

### 📄 Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hostpath-example
spec:
  containers:
  - name: viewer
    image: busybox
    command: ["sh", "-c", "cat /host/log/syslog || sleep 3600"]
    volumeMounts:
    - mountPath: /host/log
      name: host-logs
      readOnly: true
  volumes:
  - name: host-logs
    hostPath:
      path: /var/log
      type: Directory
---

```
# 📦 Persistent Volume (PV)

### 📘 Definition  
A **cluster-level resource** that provides storage. Admins can provision it manually or via a storage plugin.



### 🔧 Use Case  
- Shared storage   
- Pre-provisioned disk space


---

### 📄 Example

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-example
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /mnt/data

---

```
# 📄 Persistent Volume Claim (PVC)

### 📘 Definition  
A **request for storage** by a user or developer. It binds to an available PersistentVolume (PV) matching its requirements.



### 🔧 Use Case  
- Abstracts storage backend    
- Users don't need to know how/where storage is provisioned


---


### 📄 Example

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-example
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---

```
# 🏷️ StorageClass

### 📘 Definition  
Defines **different types of storage classes** (e.g., SSD, HDD), and how Kubernetes should provision them.



### 🔧 Use Case  
- Fast vs slow storage (SSD vs HDD)    
- Automatic dynamic provisioning


---


### 📄 Example

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-storage
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2

---

```
# ⚙️ Dynamic Provisioning

## ✅ What Is It?

**Dynamic Provisioning** allows Kubernetes to **automatically create PersistentVolumes (PVs)** when a **PersistentVolumeClaim (PVC)** is created — eliminating the need for manual pre-provisioning.

> This is made possible by associating a PVC with a **StorageClass**.

---

## 📘 Why It Matters

Without dynamic provisioning, cluster admins must manually create matching PVs before a developer can use them via PVCs.

With dynamic provisioning:
- PVC triggers automatic PV creation
- Based on parameters in the associated StorageClass
- Ideal for cloud-native and automated environments

---

## 📄 Example: PVC With Dynamic Provisioning

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
  storageClassName: fast-storage
---

```

🏷️ Corresponding StorageClass
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-storage
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
---

```
🧠 Key Points
storageClassName in PVC must match a defined StorageClass

provisioner in StorageClass determines backend (e.g., AWS EBS, GCE PD, etc.)

Kubernetes provisions the PV on demand, using the StorageClass's settings

| Feature              | Manual PVs | Dynamic PVs |
| -------------------- | ---------- | ----------- |
| Admin Setup Required | ✅ Yes      | ❌ No        |
| Automated Creation   | ❌ No       | ✅ Yes       |
| Uses StorageClass    | ❌ Optional | ✅ Required  |
| Ideal For            | On-prem    | Cloud/CI-CD |

---

```

🔁 Summary Comparison Table
| Type                    | Volatile | Node-Specific | Shared Across Pods | Backed By Host/Cloud | Auto-Provisioned |
| ----------------------- | -------- | ------------- | ------------------ | -------------------- | ---------------- |
| `emptyDir`              | ✅ Yes    | ✅ Yes         | 🚫 No              | ❌ No                 | ❌ No             |
| `hostPath`              | ❌ No     | ✅ Yes         | 🚫 No              | ✅ Yes (host)         | ❌ No             |
| `PersistentVolume`      | ❌ No     | ❌ No          | ✅ Yes              | ✅ Yes                | ❌ Optional       |
| `PersistentVolumeClaim` | ❌ No     | ❌ No          | ✅ Yes              | ✅ Yes                | ✅ If SC present  |
| `StorageClass`          | ❌ N/A    | ❌ N/A         | ❌ N/A              | ✅ Yes                | ✅ Yes            |

---

```

# 7. ResourceQuota
### 📘 Definition  
A **ResourceQuota** is a Kubernetes object used to **limit the amount of resources** (like CPU, memory, storage, pods, etc.) that can be consumed **within a specific namespace**.

> This is especially useful in **multi-tenant environments** to ensure fair resource distribution and prevent any single user or team from monopolizing cluster resources.
---
## 📌 What Can You Limit?

You can restrict the following:

- ✅ Total number of **Pods**
- ✅ Total **CPU** or **Memory** usage
- ✅ Number of **Services**, **PVCs**, **Secrets**, **ConfigMaps**
- ✅ **Storage size** per PVC
- ✅ Usage of **Custom Resources** (e.g., GPUs)

---

```

## 🧾 Sample ResourceQuota YAML

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-a-quota
  namespace: team-a
spec:
  hard:
    pods: "10"
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    persistentvolumeclaims: "5"
    requests.storage: 100Gi
---

```
🔍 Explanation:

Field	Meaning
pods: "10"	Max 10 pods allowed in the namespace
requests.cpu	Total CPU requested across all pods must not exceed 4 CPUs
limits.memory	Combined memory limits of all pods must not exceed 16 GiB

---

```
---

```

## 8. Stateful Applications

- **StatefulSets:** Manage stateful applications with stable network IDs and persistent storage.  
- Use with PVCs and Headless Services for stable identity and storage.  
- Common for databases like MongoDB, MySQL clusters.

---

```
---

```

# 9. DaemonSet

A **DaemonSet** ensures that a copy of a pod runs on all (or some) nodes in the cluster.

Useful for running cluster-wide services such as log collectors, monitoring agents, or network plugins.

When a new node is added, the DaemonSet automatically schedules a pod on it.

### Diagram: DaemonSet Pods running on all nodes


+-----------------------------------------------------------+
| 📦 Kubernetes Cluster |
| |
| +------------+ +------------+ +------------+ |
| | Node 1 | | Node 2 | | Node 3 | |
| | | | | | | |
| | [Pod: D] | | [Pod: D] | | [Pod: D] | |
| | | | | | | |
| +------------+ +------------+ +------------+ |
| |
+-----------------------------------------------------------+
---

```
---

```

# 10. Multicontainer Pod and InitContainer in Kubernetes

## 10.1 Multicontainer

A Kubernetes Pod can run multiple containers that work together. This is commonly used in design patterns like:

- **Sidecar Pattern**
- **Adapter Pattern**
- **Ambassador Pattern**

---

### 10.1.1 🔹 Sidecar Pattern

The **Sidecar pattern** involves deploying a helper container alongside the main application container within the same Pod. This auxiliary container extends or enhances the functionality of the primary application without modifying its code.

**Key Characteristics:**

- **Shared Environment:** Both containers share the same network namespace and storage volumes, facilitating seamless communication and data sharing.
- **Independent Lifecycle:** Sidecar containers can be started, stopped, or restarted independently of the main application container.
- **Use Cases:** Logging, monitoring, configuration management, and proxying requests.

**Example:**  
A sidecar container could collect logs from the main application and forward them to a centralized logging system such as Elasticsearch or Fluentd.

---

### 10.1.2 🔹 Adapter Pattern

The **Adapter pattern** is used to bridge incompatible interfaces between the main application and other services or components. By introducing an adapter container, you can transform data formats, protocols, or APIs to match the expectations of different systems.

**Key Characteristics:**

- **Protocol Translation:** Converts one protocol or data format into another, enabling interoperability.
- **Legacy Integration:** Helps integrate legacy applications that don't follow modern standards.
- **Use Cases:** Transforming log formats, adapting APIs, or converting data schemas.

**Example:**  
An adapter container modifies the output of an application to match the input requirements of a monitoring tool like Prometheus.

---

### 10.1.3 🔹 Ambassador Pattern

The **Ambassador pattern** introduces a proxy container that manages all network interactions between the main application container and external services. This abstracts communication complexity.

**Key Characteristics:**

- **Proxy Functionality:** Handles routing, authentication, and SSL termination.
- **Service Abstraction:** Simplifies application code by offloading network concerns.
- **Use Cases:** API gateways, service discovery, secure communication.

**Example:**  
An ambassador container using Nginx proxies HTTPS requests to the main application (which only understands HTTP), enabling secure communication.

---

## 10.2 InitContainer

[🎥 Video Explanation](https://www.youtube.com/watch?v=9NTr6EFmxkI)

An **initContainer** is a special type of container in a Kubernetes Pod that runs **before** the main application containers. It is used for setup tasks that must complete before the app starts.

---

### 🔑 Key Features

| Feature           | Description                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| Sequential Start  | Init containers run one at a time in the order defined.                     |
| Blocking          | Each must complete successfully before the next starts or the Pod fails.   |
| No Restart        | They are not restarted if they exit successfully.                           |
| Share Volumes     | They can share volumes with app containers for file handoff.                |

---

### ✅ Common Use Cases

1. Performing **database schema migrations**
2. **Waiting for services** (e.g., DB) to be ready
3. **Copying configuration** or **secrets** from a secure location
4. **Setting permissions** on shared volumes before the main app starts

---

```
---

```

# 11. Static Pod

**Static Pods** are managed directly by the `kubelet` on a node and are not visible through the Kubernetes API server.  
They are typically used for system-level components and run independently of the Kub


Static pods are managed by kubelet directly, not by the control plane.

Steps:

SSH into node

Check or create /etc/kubernetes/manifests/

Add YAML file (e.g., nginx-static-pod.yaml)

Kubelet starts it automatically


## 🔍 Viewing Static Pods Created by Kubelet

Static Pods are created directly by the `kubelet` by reading manifest files from a specified directory, typically `/etc/kubernetes/manifests`. These pods are not created via the Kubernetes API server but **do appear in `kubectl`** results because the `kubelet` registers them.

---

### 📌 How to List Static Pods

Run the following command to see all pods in the `kube-system` namespace (where most static pods reside):

```bash
kubectl get pods -n kube-system


🖥️ Example Output:
---
                                 READY   STATUS    RESTARTS      AGE
calico-kube-controllers-5fc7d6cf67-vvn4t   1/1     Running   2 (14d ago)   16d
calico-node-l55kh                          1/1     Running   2 (14d ago)   16d
coredns-57c9b785f6-d7wfh                   1/1     Running   0             13d
coredns-57c9b785f6-f689p                   1/1     Running   0             13d
etcd-kubernetes                            1/1     Running   3 (14d ago)   16d
kube-apiserver-kubernetes                  1/1     Running   3 (14d ago)   16d
kube-controller-manager-kubernetes         1/1     Running   3 (14d ago)   16d
kube-proxy-cs8mn                           1/1     Running   2 (14d ago)   16d
kube-scheduler-kubernetes                  1/1     Running   3 (14d ago)   

---

```

## ✳️ **12. Job and CronJob**



Kubernetes provides two important workload types for **running tasks** that aren't long-running services:

---

## ⚙️ Job

A **Job** creates one or more Pods to **run a batch task to completion**.

✅ Use it for:

- One-time data processing
- Database migration
- Sending notifications

### 🧾 Example: Job YAML

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: hello-job
spec:
  template:
    spec:
      containers:
      - name: hello
        image: busybox
        command: ["echo", "Hello, Kubernetes!"]
      restartPolicy: Never
---

```
🕒 CronJob
A CronJob runs Jobs on a scheduled, recurring basis — similar to Unix cron.

✅ Use it for:

Regular backups

Scheduled reports

Cleanup jobs

🧾 Example: CronJob YAML
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello-cron
spec:
  schedule: "*/5 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: hello
            image: busybox
            command: ["echo", "Scheduled Hello!"]
          restartPolicy: OnFailure
---

```
🧠 Notes
Jobs run once and ensure the task completes successfully

CronJobs schedule Jobs using standard cron format (minute, hour, day, etc.)

Use restartPolicy: OnFailure or Never inside Job specs

---

```
---

```

## 📦 **13. Helm**

- **What is Helm?** Kubernetes package manager.  
- **Helm Charts:** Packages of pre-configured Kubernetes resources.  
- Installing and managing applications with Helm.  
- Helm Repositories for sharing charts.

---

```
---

```

## 🔐 **14. Security & RBAC**

- **Role-Based Access Control (RBAC)**  
- **Service Accounts**  
- **Network Policies**  
- **Pod Security Policies**


Kubernetes provides a set of features to **secure your cluster**, control access, and isolate workloads. This includes **Role-Based Access Control (RBAC)**, **Service Accounts**, **Network Policies**, and **Pod Security**.

---

## ✅ Key Security Components

## 🔐 1. Role
- **Scope:** Namespaced  
- **Purpose:** Grants permissions **within a specific namespace**.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: dev
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
```

---

## 🌐 2. ClusterRole
- **Scope:** Cluster-wide  
- **Purpose:**
  - Grants permissions **across all namespaces**
  - Required for **non-namespaced resources** like `nodes`, `persistentvolumes`, etc.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cluster-admin-reader
rules:
- apiGroups: [""]
  resources: ["nodes", "pods"]
  verbs: ["get", "list"]
```

---

## 🔗 3. RoleBinding
- **Scope:** Namespaced  
- **Purpose:** Assigns a `Role` or `ClusterRole` to a user, group, or service account **within a namespace**.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods-binding
  namespace: dev
subjects:
- kind: User
  name: dev-user
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

---

## 🔗🌐 4. ClusterRoleBinding
- **Scope:** Cluster-wide  
- **Purpose:** Assigns a `ClusterRole` to users/groups/service accounts **at the cluster level**.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: read-nodes-binding
subjects:
- kind: User
  name: infra-admin
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: cluster-admin-reader
  apiGroup: rbac.authorization.k8s.io
```

---

## 🔄 Summary Table

| Component            | Scope       | Binds To         | Applies To                     |
|---------------------|-------------|------------------|--------------------------------|
| `Role`              | Namespace   | —                | Namespaced resources           |
| `ClusterRole`       | Cluster     | —                | Cluster-wide + global objects  |
| `RoleBinding`       | Namespace   | User/Group/SA    | Role or ClusterRole in a NS    |
| `ClusterRoleBinding`| Cluster     | User/Group/SA    | ClusterRole (all namespaces)   |

---

## Notes
- `apiGroups: [""]` refers to the **core API group**, e.g., `pods`, `services`.
- `apiGroups: ["apps"]` is used for resources like `deployments`, `statefulsets`.
  
---

```
---

##👤 Service Accounts
Service accounts are used by pods to authenticate to the API server.

Each pod can use a specific service account

Useful for controllers, jobs, or apps interacting with the Kubernetes API  
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-bot

---

```
##🌐 Network Policies
Define how pods communicate with each other and with external services.

Control ingress and egress traffic to pods

Implement security boundaries at the network level
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
spec:
  podSelector:
    matchLabels:
      role: frontend
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: backend
---

```
##🛡️ Pod Security Policies (Deprecated → Use PSA)
Note: PodSecurityPolicy (PSP) has been deprecated. Use Pod Security Admission (PSA) instead.

Restrict what pods can do (e.g., running as root, host networking, volume types)

PSA operates at namespace level with labels: privileged, baseline, restricted

```yaml

kubectl label namespace dev pod-security.kubernetes.io/enforce=restricted
---

```

##🧠 Best Practices
##🔒 Use least-privilege access

##📦 Isolate workloads with namespaces and NetworkPolicies

##🧪 Regularly audit access and policies

##🚫 Avoid running containers as root

---

```
---

```

## 🧲 **15. Kubernetes Affinity Cheat Sheet (YAML Example)**

This YAML example demonstrates how to use:

- ✅ **Node Affinity**  
  **Purpose:** Schedule Pods on specific nodes based on node labels.  
  **How it works:**  
  “Place this Pod only on nodes that have a certain label (e.g., `disktype=ssd`).”  
  **Use case:** Run database Pods only on nodes with SSDs.

- 🤝 **Pod Affinity**  
  **Purpose:** Schedule Pods near others with specific labels.  
  **How it works:**  
  “Place this Pod on the same node (or nearby) as another Pod with label `app=frontend`.”  
  **Use case:** Co-locate an app with its caching service.

- ❌ **Pod Anti-Affinity**  
  **Purpose:** Avoid placing Pods together.  
  **How it works:**  
  “Do not place this Pod where another with label `app=redis` is already running.”  
  **Use case:** Spread replicas across nodes for HA.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: affinity-demo-pod
  labels:
    app: demo-app
spec:
  containers:
  - name: nginx
    image: nginx
  affinity:

    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd

    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - frontend
        topologyKey: "kubernetes.io/hostname"

    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - redis
        topologyKey: "kubernetes.io/hostname"

---

```

## 16. Observability: Logging & Monitoring

- livenessProbe and readinessProbe for pod health  
- Logs via `kubectl logs`  
- Metrics Server for resource metrics  
- Prometheus + Grafana monitoring stack  
- EFK/ELK stack for log aggregation

---

```

## 17. CI/CD Integration

- GitOps with ArgoCD  
- Jenkins + Kubernetes pipelines  
- GitHub Actions integration with Kubernetes

---

```

## 18. Advanced Topics

---

### 🚫 Taints and ✅ Tolerations

| Term           | मतलब                                  |
| -------------- | ------------------------------------- |
| **Taint**      | Node पर लगाया गया रोक                 |
| **Toleration** | Pod को दी गई अनुमति उस रोक को सहने की |


**Taints:** Prevent pods from being scheduled on specific nodes.  
**Tolerations:** Allow exceptions to taints.

**Example - Taint a node:**
```bash
kubectl taint nodes node1 key=env:NoSchedule
Pod YAML with Toleration:
---

yaml

apiVersion: v1
kind: Pod
metadata:
  name: toleration-example
spec:
  containers:
  - name: nginx
    image: nginx
  tolerations:
  - key: "env"
    operator: "Equal"
    value: "production"
    effect: "NoSchedule"
---

```   
# 📈 Horizontal Pod Autoscaler (HPA)

The **Horizontal Pod Autoscaler** (HPA) automatically scales the number of **pod replicas** in a Deployment, ReplicaSet, or StatefulSet based on observed resource usage such as **CPU** or **memory**.

---

## ✅ What It Does

- Monitors CPU/memory usage (or custom metrics)
- Increases or decreases the number of pods accordingly
- Helps apps handle dynamic workloads efficiently

---

## ⚙️ Step 1: Create a Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        resources:
          requests:
            cpu: "100m"
          limits:
            cpu: "200m"
---

```  
# ⚙️ Create Horizontal Pod Autoscaler (HPA)

This example shows how to create an HPA that **scales a Deployment named `nginx-deployment`** based on CPU usage.

---

## 📄 HPA YAML Definition

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx-deployment
  minReplicas: 1
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50

---

```
# 📊 Vertical Pod Autoscaler (VPA)

The **Vertical Pod Autoscaler (VPA)** automatically adjusts the **CPU and memory requests/limits** of pods based on usage over time.

Unlike the **Horizontal Pod Autoscaler (HPA)**, which changes the number of pod replicas, the VPA modifies the **resource allocation** of each pod.

---

## ✅ What It Does

- Recommends or sets optimized CPU and memory values
- Helps prevent under- or over-provisioning
- Can be used in 3 modes:
  - `"Off"` – just provides recommendations
  - `"Auto"` – automatically updates pod resources (will restart pods)
  - `"Initial"` – sets resources only at pod startup

---

## 📄 Example VPA YAML

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: nginx-vpa
spec:
  targetRef:
    apiVersion: "apps/v1"
    kind:       Deployment
    name:       nginx-deployment
  updatePolicy:
    updateMode: "Auto"

---

```    
# 🧩 Custom Resource Definitions (CRDs)

## ✅ What are CRDs?

**Custom Resource Definitions (CRDs)** allow you to extend the Kubernetes API by defining your **own resource types**.

You can create new objects — like `Database`, `KafkaCluster`, `BackupJob`, etc. — and manage them just like built-in Kubernetes objects.

---

## 📘 Why Use CRDs?

- Define **custom Kubernetes objects** specific to your application domain
- Used in combination with **operators/controllers** to build automation
- Enables **declarative APIs** for managing complex infrastructure

---

## 🧾 Example: Define a CRD

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: crontabs.stable.example.com
spec:
  group: stable.example.com
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                schedule:
                  type: string
                image:
                  type: string
  scope: Namespaced
  names:
    plural: crontabs
    singular: crontab
    kind: CronTab
    shortNames:
    - ct

---

```  
Sample Custom Resource:

```yaml
apiVersion: myorg.com/v1
kind: MySQLCluster
metadata:
  name: sample-db
spec:
  size: 3
---

```  
🤖 Operators
An Operator watches for CRDs and performs operations on them.

Operator behavior is implemented as code (usually in Go or Python).

MySQLCluster Custom Resource:

```yaml
apiVersion: myorg.com/v1
kind: MySQLCluster
metadata:
  name: demo-db
spec:
  size: 2
---

```  
What the Operator does:

✅ On creation: Deploys a StatefulSet of 2 MySQL instances.

🔄 On spec.size change: Scales StatefulSet up/down.

🧹 On deletion: Cleans up resources.

The Operator is deployed as a Deployment in the cluster, continuously watching the CRD.
---

```
---

``` 

## 19. Real World Scenarios / Projects

Explore practical Kubernetes use cases and project ideas that reflect real-world production environments.

---

### 🛠️ Examples:

- 🚀 **Deploying Node.js + MongoDB Application**  
  Use Deployments, Services, ConfigMaps, and Persistent Volumes to deploy a full-stack app.

- 📰 **Running WordPress + MySQL**  
  Use StatefulSets or Deployments with PVCs and Helm charts for CMS deployments.

- 🌐 **Creating Scalable REST APIs**  
  Build stateless APIs with auto-scaling and load balancing using Ingress and HPA.

- 🏗️ **High Availability Cluster Setups**  
  Set up clusters with node pools, pod disruption budgets, and anti-affinity rules.

- 🛡️ **Backup & Disaster Recovery Strategies**  
  Use tools like Velero, volume snapshots, and replica sets for data safety.

---

✅ These projects reinforce:
- Core Kubernetes concepts  
- Real-world application of storage, scaling, and networking  
- DevOps skills such as monitoring, logging, CI/CD, and troubleshooting

---

```

*Happy Kubernetes learning! 🚀*
📚 Additional Resources
Helm Documentation

Kustomize Documentation

Horizontal Pod Autoscaler

Vertical Pod Autoscaler

Network Policies

Pod Security Policies

Istio Documentation

Prometheus Monitoring

EFK Stack for Logging
---

```
