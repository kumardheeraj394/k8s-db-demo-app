
# Kubernetes Learning Path

A comprehensive guide to learning Kubernetes from basics to advanced concepts, including installation, core concepts, application deployment, networking, storage, security, and real-world projects.

---

## Contents

1. Basics & Core Concepts  
2. Kubernetes Installation & Setup  
3. Pods, ReplicaSets, Deployments  
4. Services & Networking  
5. Config & Secrets Management  
6. Volumes & Storage  
7. Stateful Applications
8. Daemonset  
9. Job & CronJobs  
10. Helm (Package Manager)  
11. Security & RBAC  
12. Observability: Logging & Monitoring  
13. CI/CD Integration  
14. Advanced Topics  
15. Real World Scenarios / Projects  

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

## 3. Pods, ReplicaSets, Deployments

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

- **DNS & CoreDNS:** Provides service discovery inside the cluster.  
- **Headless Service:** No cluster IP, used for direct pod access (e.g., StatefulSets).  
- **Ingress & Network Policies:** Manage external access and network traffic rules.

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

## 7. Stateful Applications

- **StatefulSets:** Manage stateful applications with stable network IDs and persistent storage.  
- Use with PVCs and Headless Services for stable identity and storage.  
- Common for databases like MongoDB, MySQL clusters.

### Diagram: StatefulSets with PVCs and Headless Service

```plaintext
+-----------------------------------------------------------+
|                       Kubernetes Cluster                  |
|                                                           |
|   +-----------------+        +-----------------+          |
|   | StatefulSet Pod |        | StatefulSet Pod |          |
|   | (mongodb-0)       |        | (mongodb-1)       |          |
|   |  +-----------+  |        |  +-----------+  |          |
|   |  | Container |  |        |  | Container |  |          |
|   |  +-----------+  |        |  +-----------+  |          |
|   |  Persistent    |        |  Persistent    |          |
|   |  Volume Claim  |        |  Volume Claim  |          |
|   |  (mongo-pvc-0) |        |  (mongo-pvc-1) |          |
|   +-------+---------+        +--------+--------+          |
|           |                           |                   |
|           |                           |                   |
|        +--+---------------------------+--+                |
|        |        Headless Service           |              |
|        |  (stable network identity DNS)   |              |
|        +----------------------------------+              |
|                                                           |
+-----------------------------------------------------------+

## 8. DaemonSet

- **DaemonSet:** Ensures that a copy of a pod runs on all (or some) nodes in the cluster.  
- Useful for running cluster-wide services such as log collectors, monitoring agents, or network plugins.  
- When a new node is added, the DaemonSet automatically schedules a pod on it.

### Diagram: DaemonSet Pods running on all nodes

```plaintext
+-----------------------------------------------------------+
|                      Kubernetes Cluster                   |
|                                                           |
|   +------------+    +------------+    +------------+      |
|   |   Node 1   |    |   Node 2   |    |   Node 3   |      |
|   | +--------+ |    | +--------+ |    | +--------+ |      |
|   | | Daemon | |    | | Daemon | |    | | Daemon | |      |
|   | | Pod    | |    | | Pod    | |    | | Pod    | |      |
|   | +--------+ |    | +--------+ |    | +--------+ |      |
|   +------------+    +------------+    +------------+      |
|                                                           |
+-----------------------------------------------------------+


## 9. Job & CronJobs

- **Jobs:** One-time batch tasks.  
- **CronJobs:** Scheduled tasks similar to cron.

---

## 10. Helm (Package Manager)

- What is Helm? Kubernetes package manager.  
- Helm Charts: Packages of pre-configured Kubernetes resources.  
- Installing and managing applications with Helm.  
- Helm Repositories for sharing charts.

---

## 11. Security & RBAC

- Role-Based Access Control (RBAC)  
- Service Accounts  
- Network Policies  
- Pod Security Policies

---

## 12. Observability: Logging & Monitoring

- livenessProbe and readinessProbe for pod health  
- Logs via `kubectl logs`  
- Metrics Server for resource metrics  
- Prometheus + Grafana monitoring stack  
- EFK/ELK stack for log aggregation

---

## 13. CI/CD Integration

- GitOps with ArgoCD  
- Jenkins + Kubernetes pipelines  
- GitHub Actions integration with Kubernetes

---

## 14. Advanced Topics

- Taints and Tolerations  
- Node Affinity / Anti-affinity  
- Horizontal Pod Autoscaler (HPA)  
- Vertical Pod Autoscaler  
- Custom Resource Definitions (CRDs)  
- Operators

---

## 15. Real World Scenarios / Projects

- Deploying Node.js + MongoDB application  
- Running WordPress + MySQL  
- Creating scalable REST APIs  
- High availability cluster setups  
- Backup & disaster recovery strategies

---

*Happy Kubernetes learning! 🚀*
