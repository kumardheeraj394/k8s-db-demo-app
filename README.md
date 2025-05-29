# 📦 k8s-db-demo-app

A simple Node.js + MongoDB email collection app deployed on Kubernetes using MetalLB for LoadBalancer support.

---

## 🧰 Project Structure

```bash
k8s-db-demo-app/
├── deployment.yaml         # Node.js app Deployment with ConfigMap-based env
├── service.yaml            # LoadBalancer type Service for external access
├── configmap.yaml          # MongoDB connection and port details
├── metallb/
│   ├── ipaddresspool.yaml  # MetalLB IP address pool definition
│   └── l2advertisement.yaml # MetalLB Layer 2 advertisement
├── index.js                # Main Node.js server file
├── index.html              # Frontend for submitting & listing emails
├── Dockerfile              # Docker build file for the Node.js app
└── README.md               # Project documentation



Prerequisites
Kubernetes cluster (e.g., Minikube, K3s, kubeadm)

MetalLB configured on your cluster

Docker installed for building the image (if you want to build it locally)

Node.js app image pushed to Docker Hub (e.g., dheeraj394/node-mongo-db:<tag>)


Setup Instructions
1. Clone the Repo

git clone https://github.com/kumardheeraj394/k8s-db-demo-app.git
cd k8s-db-demo-app


2. Install MetalLB (only once per cluster)

kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.10/config/manifests/metallb-native.yaml

3. Create an IPAddressPool
This defines the pool of IPs MetalLB can assign to LoadBalancer services.yaml

# ipaddresspool.yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: my-ip-pool
  namespace: metallb-system
spec:
  addresses:
  - 10.10.37.240-10.10.37.250

kubectl apply -f ipaddresspool.yaml

Make sure the IP pool defined in ipaddresspool.yaml (e.g., 192.168.1.240-250) is within your LAN range and not in use.


Application-Deployment

4. Create the ConfigMap

kubectl apply -f configmap.yaml
Example content:

apiVersion: v1
kind: ConfigMap
metadata:
  name: mongo-config
data:
  MONGO_URL: "mongodb://mongodb:27017/mydb"
  MONGO_PORT: "27017"
  MONGO_DB: "mydb"

5. Deploy MongoDB (if needed)
If you don’t have MongoDB already running in your cluster, you can deploy it quickly:

bash
Copy
Edit
kubectl apply -f https://raw.githubusercontent.com/kumardheeraj394/k8s-db-demo-app/main/mongo-deployment.yaml
Adjust or create your own MongoDB deployment as required.

6. Deploy the Node.js App
bash
Copy
Edit
kubectl apply -f deployment.yaml
This reads environment variables from configMap and runs the app.

7. Expose the Service
bash
Copy
Edit
kubectl apply -f service.yaml
Example service.yaml:

yaml
Copy
Edit
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
8. Access the App
Check the external IP assigned:


kubectl get svc nodejsdbapp-service
Example output:

pgsql

NAME                  TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)        AGE
nodejsdbapp-service   LoadBalancer   10.96.132.20   10.10.37.249    3002:31888/TCP   10m
Now open:
http://10.10.37.249 in your browser.

🛠 Environment Variables Used
These are injected via configmap.yaml:

Variable	Description
MONGO_URL	MongoDB connection URI
MONGO_PORT	MongoDB port (optional)
MONGO_DB	MongoDB database name
PORT	Node.js server port (default: 3000)

🖥️ App Features
Submit an email address via a form

Store it in MongoDB

View stored emails dynamically via frontend

Version displayed via HTML comment (index.html)

You can inject version dynamically via env or Docker tag if needed

🐳 Docker
To build and push your Docker image:


docker build -t dheeraj394/node-mongo-db:01 .
docker push dheeraj394/node-mongo-db:01
Then update the image tag in deployment.yaml.

🧼 Cleanup
To remove all resources:


kubectl delete -f service.yaml
kubectl delete -f deployment.yaml
kubectl delete -f configmap.yaml
kubectl delete -f metallb/ipaddresspool.yaml
kubectl delete -f metallb/l2advertisement.yaml
