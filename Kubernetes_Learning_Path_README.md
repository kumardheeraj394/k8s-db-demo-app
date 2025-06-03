
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
8. DaemonSet
9. Multicontainer pod and  initContainer
9. Multicontainer Pod and InitContainer  
    9.1 Multicontainer  
        9.1.1 Sidecar Pattern  
        9.1.2 Adapter Pattern  
        9.1.3 Ambassador Pattern  
    9.2 InitContainer 
10. StaticPod 
11. Job & CronJobs  
12. Helm (Package Manager)  
13. Security & RBAC  
14. Observability: Logging & Monitoring  
15. CI/CD Integration  
16. Advanced Topics  
17. Real World Scenarios / Projects  

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

---

# 8. DaemonSet

A **DaemonSet** ensures that a copy of a pod runs on all (or some) nodes in the cluster.

Useful for running cluster-wide services such as log collectors, monitoring agents, or network plugins.

When a new node is added, the DaemonSet automatically schedules a pod on it.

### Diagram: DaemonSet Pods running on all nodes


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

# 9. Multicontainer Pod and InitContainer in Kubernetes

## 9.1 Multicontainer

A Kubernetes Pod can run multiple containers that work together. This is commonly used in design patterns like:

- **Sidecar Pattern**
- **Adapter Pattern**
- **Ambassador Pattern**

---

### 9.1.1 🔹 Sidecar Pattern

The **Sidecar pattern** involves deploying a helper container alongside the main application container within the same Pod. This auxiliary container extends or enhances the functionality of the primary application without modifying its code.

**Key Characteristics:**

- **Shared Environment:** Both containers share the same network namespace and storage volumes, facilitating seamless communication and data sharing.
- **Independent Lifecycle:** Sidecar containers can be started, stopped, or restarted independently of the main application container.
- **Use Cases:** Logging, monitoring, configuration management, and proxying requests.

**Example:**  
A sidecar container could collect logs from the main application and forward them to a centralized logging system such as Elasticsearch or Fluentd.

---

### 9.1.2 🔹 Adapter Pattern

The **Adapter pattern** is used to bridge incompatible interfaces between the main application and other services or components. By introducing an adapter container, you can transform data formats, protocols, or APIs to match the expectations of different systems.

**Key Characteristics:**

- **Protocol Translation:** Converts one protocol or data format into another, enabling interoperability.
- **Legacy Integration:** Helps integrate legacy applications that don't follow modern standards.
- **Use Cases:** Transforming log formats, adapting APIs, or converting data schemas.

**Example:**  
An adapter container modifies the output of an application to match the input requirements of a monitoring tool like Prometheus.

---

### 9.1.3 🔹 Ambassador Pattern

The **Ambassador pattern** introduces a proxy container that manages all network interactions between the main application container and external services. This abstracts communication complexity.

**Key Characteristics:**

- **Proxy Functionality:** Handles routing, authentication, and SSL termination.
- **Service Abstraction:** Simplifies application code by offloading network concerns.
- **Use Cases:** API gateways, service discovery, secure communication.

**Example:**  
An ambassador container using Nginx proxies HTTPS requests to the main application (which only understands HTTP), enabling secure communication.

---

## 9.2 InitContainer

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



# 10. Static Pod

**Static Pods** are managed directly by the `kubelet` on a node and are not visible through the Kubernetes API server.  
They are typically used for system-level components and run independently of the Kub

# 11. Job & CronJobs

- **Job:** One-time batch tasks that run to completion.  
- **CronJobs:** Scheduled tasks that run periodically similar to cron jobs.


## 12. Job & CronJobs

- **Jobs:** One-time batch tasks.  
- **CronJobs:** Scheduled tasks similar to cron.

---

## 13. Helm (Package Manager)

- What is Helm? Kubernetes package manager.  
- Helm Charts: Packages of pre-configured Kubernetes resources.  
- Installing and managing applications with Helm.  
- Helm Repositories for sharing charts.

---

## 14. Security & RBAC

- Role-Based Access Control (RBAC)  
- Service Accounts  
- Network Policies  
- Pod Security Policies

---

## 15. Observability: Logging & Monitoring

- livenessProbe and readinessProbe for pod health  
- Logs via `kubectl logs`  
- Metrics Server for resource metrics  
- Prometheus + Grafana monitoring stack  
- EFK/ELK stack for log aggregation

---

## 16. CI/CD Integration

- GitOps with ArgoCD  
- Jenkins + Kubernetes pipelines  
- GitHub Actions integration with Kubernetes

---

## 17. Advanced Topics

- Taints and Tolerations  
- Node Affinity / Anti-affinity  
- Horizontal Pod Autoscaler (HPA)  
- Vertical Pod Autoscaler  
- Custom Resource Definitions (CRDs)  
- Operators

---

## 18. Real World Scenarios / Projects

- Deploying Node.js + MongoDB application  
- Running WordPress + MySQL  
- Creating scalable REST APIs  
- High availability cluster setups  
- Backup & disaster recovery strategies

---

*Happy Kubernetes learning! 🚀*
