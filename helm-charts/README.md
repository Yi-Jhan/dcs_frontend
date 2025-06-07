# Introduction 
Using Helm to manage app on the Kubernetes cluster.

# Getting Started
Debugging Templates:

<code>helm template --debug l11-mgm-portal/  ./l11-mgm-portal/</code>

Helm Install:

<code>helm install --set namespece=development $HELM_RELEASE -f ./l11-mgm-portal/values.yaml ./l11-mgm-portal -n $NAMESPACE</code>

Helm List:

<code>helm list -n development</code>

Helm Upgrade:

<code>helm list -n development</code>

Helm Uninstall:

<code>helm uninstall $HELM_RELEASE </code>