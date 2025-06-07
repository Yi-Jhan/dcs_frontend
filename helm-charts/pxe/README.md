# Introduction 
Using Helm to manage app on the Kubernetes cluster.

# Getting Started
Debugging Templates:

<code>helm template --debug pxe ./pxe/</code>

Helm Install:

<code>helm install --set namespece=pxe pxe -f ./pxe/values.yaml ./pxe -n pxe</code>

Helm List:

<code>helm list -n development</code>

Helm Upgrade:

<code>helm upgrade --set namespece=pxe pxe -f ./pxe/values.yaml ./pxe -n development</code>

Helm Uninstall:

<code>helm uninstall pxe -n development</code>