# Introduction 
Using Helm to manage app on the Kubernetes cluster.

# Getting Started
Debugging Templates:

<code>helm template --debug dcs-backend/  ./dcs-backend/</code>

Helm Install:

<code>helm install --set namespece=development $HELM_RELEASE -f ./dcs-backend/values.yaml ./dcs-backend -n $NAMESPACE</code>

Helm List:

<code>helm list -n development</code>

Helm Upgrade:

<code>helm list -n development</code>

Helm Uninstall:

<code>helm uninstall $HELM_RELEASE </code>
