
# Kubernetes Primer

## 1. 📛 What is a Namespace in Kubernetes?
A namespace in Kubernetes is a way to divide cluster resources between multiple users or applications. It's like a virtual cluster inside your physical cluster, helping organize and isolate resources.

### 1.1 Why Use Namespaces?
Namespaces are useful when:
- You want to separate environments like dev, staging, and production.
- Multiple teams or apps share a single cluster and need resource isolation.
- You want to apply resource quotas, network policies, or role-based access per group/project.

### 1.2 Default Namespaces in Kubernetes

| Namespace       | Purpose                                                              |
|----------------|----------------------------------------------------------------------|
| default         | Used when no other namespace is specified.                           |
| kube-system     | For system components like kube-dns, kube-proxy, etc.                |
| kube-public     | Mostly unused, readable by all users (including unauthenticated).    |
| kube-node-lease | Used for node heartbeat (for faster node failure detection).         |

### 1.3 Example Commands
```bash
kubectl create namespace dev
kubectl run nginx --image=nginx -n dev
kubectl config set-context --current --namespace=dev
kubectl get namespaces
kubectl get ns
```

> ⚠️ Namespaces do not provide hard security boundaries—they're mainly for logical separation and resource management. For stronger isolation, use Network Policies and RBAC.

---

## 2. 🧱 What is a Pod in Kubernetes?
A Pod is the smallest and simplest deployable unit in Kubernetes. It represents a single instance of a running process in your cluster.

### 2.1 Key Features
- A Pod can contain one or more containers (usually one).
- All containers in a Pod:
  - Share the same network IP address.
  - Share storage volumes.
  - Can communicate over localhost.
- Pods are ephemeral — they can die and be replaced at any time.

### 2.2 Pod Use Cases
- Run a single container (e.g., Nginx web server).
- Run multiple tightly coupled containers (e.g., a logging sidecar with the main app).

### 2.3 Example Commands
```bash
kubectl get pods
kubectl get pods -n nodejsdbapp
kubectl run nginx-pod --image=nginx -n nodejsdbapp
```

---

## 3. 🚀 What is a Deployment in Kubernetes?
A Deployment is a Kubernetes object that manages a replicated, scalable set of Pods. It ensures your desired number of pods are running and updates them in a controlled way.

### 3.1 Why Use Deployments?
- Automatically manage replica pods.
- Enable rolling updates and rollbacks.

```bash
kubectl get deployment
kubectl get deployment -n nodejsdbapp
```

---

## 4. 🔁 What is a Replica in Kubernetes?
A replica is simply a copy of a Pod.

### 4.1 Purpose
- Ensure high availability and load balancing by running multiple instances of the same Pod.
- Self-healing: If a pod crashes, the deployment will replace it.

---

## 5. 🔁 What is a ReplicaSet in Kubernetes?
A ReplicaSet (RS) ensures a specified number of pod replicas are running at any given time.

### 5.1 Key Points
- Watches over a set of pods with specific labels.
- If a pod crashes or is deleted, the ReplicaSet creates a new one.
- Underlying mechanism used by Deployments.

---

## 6. 📘 What is a ConfigMap in Kubernetes?
A ConfigMap is used to store configuration data in key-value pairs.

### 6.1 Why Use ConfigMaps?
- Keeps application code separate from configuration.
- Easy to update configs without rebuilding container images.
- Allows same app image to be used in different environments (dev, test, prod).

---

## 7. 🔐 What is a Secret in Kubernetes?
A Secret is used to store sensitive data such as passwords, API tokens, SSH keys, and TLS certificates.

### 7.1 Example Secret YAML
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
type: Opaque
data:
  username: YWRtaW4=          # base64 of 'admin'
  password: cGFzc3dvcmQxMjM=  # base64 of 'password123'
```

### 7.2 Encoding Example
```bash
echo -n 'admin' | base64
```

### 7.3 Creating Secrets
From Command Line:
```bash
kubectl create secret generic my-secret   --from-literal=username=admin   --from-literal=password=password123
```
From YAML:
```bash
kubectl apply -f my-secret.yaml
```

### 7.4 Using Secrets in Pods
**As Environment Variables:**
```yaml
env:
- name: USERNAME
  valueFrom:
    secretKeyRef:
      name: my-secret
      key: username
- name: PASSWORD
  valueFrom:
    secretKeyRef:
      name: my-secret
      key: password
```

**As Files in a Volume:**
```yaml
volumes:
- name: secret-volume
  secret:
    secretName: my-secret

volumeMounts:
- name: secret-volume
  mountPath: "/etc/secret"
  readOnly: true
```

### 7.5 Commands Cheat Sheet
| Task                  | Command                                                                 |
|-----------------------|-------------------------------------------------------------------------|
| View all secrets      | `kubectl get secrets`                                                    |
| View secret details   | `kubectl describe secret my-secret`                                     |
| Decode a key          | `kubectl get secret my-secret -o jsonpath="{.data.username}"`           |
| Delete a secret       | `kubectl delete secret my-secret`                                       |

### 7.6 Secret vs ConfigMap
| Feature   | Secret          | ConfigMap        |
|-----------|------------------|------------------|
| Data type | Sensitive        | Non-sensitive    |
| Stored as | Base64-encoded   | Plaintext        |
| Use case  | Passwords, tokens, certs | App configs, URLs, flags |

---

## 8. 🔧 What is a Service in Kubernetes?
A Service is an abstraction that defines a logical set of Pods and a policy to access them.

Pods are ephemeral and can change IP addresses. A Service provides a stable IP and DNS name, ensuring reliable access.

### 8.1 Types of Kubernetes Services
| Type          | Purpose                                                              |
|---------------|----------------------------------------------------------------------|
| ClusterIP     | Default. Accessible only within the cluster via internal IP.         |
| NodePort      | Exposes the service on each Node’s IP at a static port.              |
| LoadBalancer  | Exposes the service externally using a cloud provider's load balancer.|
| ExternalName  | Maps a service to a DNS name outside the cluster.                    |

### 8.2 Example Commands
```bash
kubectl get svc
kubectl get svc -n nodejsdbapp
```
