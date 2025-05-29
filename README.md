# 📦 k8s-db-demo-app

A simple Node.js + MongoDB email collection app deployed on Kubernetes using MetalLB for LoadBalancer support.

---

## 🧰 Project Structure

```bash
k8s-db-demo-app/
|__ argocd/
|   |___ nodejsapp-argocd.yaml
|__ k8s-manifest/
|   |___ Namespace.yaml
|   |___ mongo-configmap.yaml          # MongoDB connection and port details
|   |___ mongo-db-service.yaml
|   |___ mongo-db.deployment.yaml
|   |___ nodejsapp-deployment.yaml
|   |___ service.yaml
├── index.js                # Main Node.js server file
├── index.html              # Frontend for submitting & listing emails
├── Dockerfile              # Docker build file for the Node.js app
└── README.md               # Project documentation
```

## ✅ Prerequisites

- Kubernetes cluster (e.g., Minikube, K3s, kubeadm)
- MetalLB configured on your cluster
- Docker installed for building the image (if you want to build it locally)
- Node.js app image pushed to Docker Hub (e.g., `dheeraj394/node-mongo-db:<tag>`)

## 🚀 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/kumardheeraj394/k8s-db-demo-app.git
cd k8s-db-demo-app
```

### 2. Install MetalLB (only once per cluster)

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.10/config/manifests/metallb-native.yaml
```

### 3. Create an IPAddressPool

`ipaddresspool.yaml`

```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: my-ip-pool
  namespace: metallb-system
spec:
  addresses:
  - 10.10.37.240-10.10.37.250
```

```bash
kubectl apply -f metallb/ipaddresspool.yaml
```

Ensure the defined IP pool is within your LAN range and not in use.

## 📦 Application Deployment

### 4. Create the ConfigMap

```bash
kubectl apply -f k8s-manifest/mongo-configmap.yaml
```

Example `mongo-configmap.yaml` content:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mongo-config
data:
  MONGO_URL: "mongodb://mongodb:27017/mydb"
  MONGO_PORT: "27017"
  MONGO_DB: "mydb"
```

### 5. Deploy MongoDB

```bash
kubectl apply -f k8s-manifest/mongo-db.deployment.yaml
kubectl apply -f k8s-manifest/mongo-db-service.yaml
```

### 6. Deploy the Node.js App

```bash
kubectl apply -f k8s-manifest/nodejsapp-deployment.yaml
```

### 7. Expose the Service

```bash
kubectl apply -f k8s-manifest/service.yaml
```

Example `service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nodejsdbapp-service
spec:
  selector:
    app: nodejsdbapp
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 3002
      targetPort: 3000
```

### 8. Access the App

Check the external IP assigned:

```bash
kubectl get svc -n nodejsdbapp
```

Example output:

```
NAME                  TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)           AGE
nodejsdbapp   LoadBalancer   10.96.132.20   10.10.37.249    3002:31888/TCP    10m
```

Open in browser: `http://10.10.37.249:3002`

---

## 🛠 Environment Variables Used

| Variable    | Description                     |
|-------------|----------------------------------|
| MONGO_URL   | MongoDB connection URI          |
| MONGO_PORT  | MongoDB port (optional)         |
| MONGO_DB    | MongoDB database name           |
| PORT        | Node.js server port (default: 3000) |

---

## 🖥️ App Features

- Submit an email address via a form
- Store it in MongoDB
- View stored emails dynamically via frontend
- Version displayed via HTML comment (`index.html`)

---

## 🐳 Docker

To build and push your Docker image:

```bash
docker build -t dheeraj394/node-mongo-db:01 .
docker push dheeraj394/node-mongo-db:01
```

Then update the image tag in `k8s-manifest/nodejsapp-deployment.yaml`.

---

## 🧼 Cleanup

```bash
kubectl delete -f k8s-manifest/service.yaml
kubectl delete -f k8s-manifest/nodejsapp-deployment.yaml
kubectl delete -f k8s-manifest/mongo-db.deployment.yaml
kubectl delete -f k8s-manifest/mongo-db-service.yaml
kubectl delete -f k8s-manifest/mongo-configmap.yaml
kubectl delete -f metallb/ipaddresspool.yaml
kubectl delete -f metallb/l2advertisement.yaml
```
## 9 deploy using argocd
a). Firstly setup argocd within cluster.
...
b). Execute Below command
```bash
kubectl apply -f https://raw.githubusercontent.com/kumardheeraj394/k8s-db-demo-app/main/argocd/nodejsapp-argocd.yaml
```
