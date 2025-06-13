🛠️ What is Helm?
Helm is a package manager for Kubernetes — like apt for Ubuntu or yum for CentOS, but specifically designed to manage Kubernetes applications.

Helm helps you define, install, and upgrade complex Kubernetes applications.

Applications are packaged into something called a Helm chart.

Helm charts are reusable, shareable, and version-controlled.

📦 What is a Helm Chart?
A Helm Chart is a collection of files that describes a related set of Kubernetes resources. It includes:

Chart.yaml: Metadata (name, version, etc.)

values.yaml: Default configuration values

templates/: Templated Kubernetes YAML files

📄 What is values.yaml?
The values.yaml file is used to provide default configuration values for the Helm chart.

You can override these values at install/upgrade time.

These values are used in the templated manifests inside the templates/ directory.

📌 Example
Suppose you have a deployment.yaml template like this:

yaml
Copy
Edit
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.app.name }}
spec:
  replicas: {{ .Values.app.replicas }}
And your values.yaml might look like:

yaml
Copy
Edit
app:
  name: my-app
  replicas: 3
When you run:

bash
Copy
Edit
helm install my-release ./my-chart
It fills the placeholders ({{ .Values.* }}) using values.yaml, generating the final manifest with:

yaml
Copy
Edit
metadata:
  name: my-app
spec:
  replicas: 3
✅ Why Use Helm?
Reuse and version-control Kubernetes deployments

Simplify CI/CD pipelines

Manage complex apps like Prometheus, ArgoCD, etc.

Rollback, upgrade, and test deployments easily

