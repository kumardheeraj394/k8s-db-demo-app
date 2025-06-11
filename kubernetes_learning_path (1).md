📘 Kubernetes Command Reference with Use Cases
markdown
Copy
Edit
# Kubernetes kubectl Command Cheat Sheet

A comprehensive list of `kubectl` commands along with their use cases, organized by functionality.

---

## 🚀 Cluster Info & Management

| Command | Use Case |
|--------|----------|
| `kubectl version` | Show client and server version |
| `kubectl cluster-info` | Show cluster endpoint URLs |
| `kubectl config view` | View kubeconfig settings |
| `kubectl config get-contexts` | List available contexts |
| `kubectl config use-context <name>` | Switch to a different cluster/context |
| `kubectl get nodes` | List all cluster nodes |
| `kubectl describe node <node>` | View detailed info about a specific node |
| `kubectl cordon <node>` | Mark a node unschedulable |
| `kubectl drain <node>` | Evict pods from a node |
| `kubectl uncordon <node>` | Mark node as schedulable again |

---

## 📦 Pod Management

| Command | Use Case |
|--------|----------|
| `kubectl get pods` | List pods in current namespace |
| `kubectl get pods -n <namespace>` | List pods in a specific namespace |
| `kubectl describe pod <pod>` | View pod details |
| `kubectl logs <pod>` | Show logs of the first container in pod |
| `kubectl logs <pod> -c <container>` | Show logs from a specific container |
| `kubectl exec -it <pod> -- /bin/bash` | Access shell inside pod container |
| `kubectl delete pod <pod>` | Delete a pod |
| `kubectl port-forward <pod> 8080:80` | Forward local port to pod |

---

## 📦 Deployment Management

| Command | Use Case |
|--------|----------|
| `kubectl get deployments` | List all deployments |
| `kubectl create deployment nginx --image=nginx` | Create deployment using image |
| `kubectl scale deployment nginx --replicas=3` | Scale a deployment |
| `kubectl rollout status deployment nginx` | Check rollout progress |
| `kubectl rollout undo deployment nginx` | Rollback to previous deployment |
| `kubectl delete deployment nginx` | Delete a deployment |

---

## 📘 YAML File Operations

| Command | Use Case |
|--------|----------|
| `kubectl apply -f file.yaml` | Create/update resource from file |
| `kubectl create -f file.yaml` | Create resource (error if exists) |
| `kubectl delete -f file.yaml` | Delete resource from file |
| `kubectl diff -f file.yaml` | Show changes before applying |
| `kubectl edit <resource> <name>` | Edit a running resource live |

---

## 🎯 Services & Networking

| Command | Use Case |
|--------|----------|
| `kubectl get svc` | List services |
| `kubectl expose deployment nginx --port=80 --type=NodePort` | Expose deployment |
| `kubectl get endpoints` | Show service endpoints |
| `kubectl port-forward service/<svc> 8080:80` | Forward port to service |
| `kubectl describe service <svc>` | Service details and configuration |

---

## 📂 Namespaces

| Command | Use Case |
|--------|----------|
| `kubectl get namespaces` | List all namespaces |
| `kubectl create namespace <name>` | Create a new namespace |
| `kubectl delete namespace <name>` | Delete a namespace |
| `kubectl config set-context --current --namespace=<ns>` | Set default namespace for context |

---

## 🔐 ConfigMaps & Secrets

| Command | Use Case |
|--------|----------|
| `kubectl create configmap my-config --from-literal=key=value` | Create configmap |
| `kubectl get configmaps` | List all configmaps |
| `kubectl describe configmap <name>` | Describe configmap |
| `kubectl create secret generic my-secret --from-literal=key=value` | Create secret |
| `kubectl get secrets` | List secrets |
| `kubectl describe secret <name>` | View secret details |
| `kubectl get secret <name> -o yaml` | View base64-encoded secret YAML |

---

## 💾 Persistent Volumes

| Command | Use Case |
|--------|----------|
| `kubectl get pvc` | List Persistent Volume Claims |
| `kubectl get pv` | List Persistent Volumes |
| `kubectl describe pvc <name>` | Get status and bound PV info |

---

## ⚙️ Advanced Workloads

| Command | Use Case |
|--------|----------|
| `kubectl get statefulsets` | List StatefulSets |
| `kubectl get daemonsets` | List DaemonSets |
| `kubectl get jobs` | List batch Jobs |
| `kubectl get cronjobs` | List CronJobs |
| `kubectl delete job <name>` | Delete a Job |

---

## 🔍 Debugging & Monitoring

| Command | Use Case |
|--------|----------|
| `kubectl describe <resource> <name>` | Describe resource status |
| `kubectl get events` | Get recent events in cluster |
| `kubectl top pod` | Show pod CPU/memory usage (requires metrics-server) |
| `kubectl top node` | Show node resource usage |

---

## 📤 Exporting Resources

| Command | Use Case |
|--------|----------|
| `kubectl get deployment nginx -o yaml` | Export resource definition |
| `kubectl get all -o yaml > backup.yaml` | Backup all resources |

---

## 🧪 Shortcuts

| Command | Use Case |
|--------|----------|
| `kubectl get all` | Get all resources: pods, svc, deployments |
| `kubectl get po,svc` | Get selected resources |
| `kubectl get po -o wide` | Get pods with more info (IPs, nodes) |
| `kubectl get po --watch` | Continuously monitor pod status |
| `kubectl explain pod` | Show documentation of a resource type |

---

> ✅ Keep this README handy for daily Kubernetes operations!
