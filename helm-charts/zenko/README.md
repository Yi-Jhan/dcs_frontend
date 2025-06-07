# Introduction 
Using Helm to manage app on the Kubernetes cluster.

# Getting Started
Debugging Templates:

<code>helm template --debug zenko ./zenko/</code>

Helm Install:

<code>helm install --set namespece=zenko zenko -f ./zenko/values.yaml ./zenko -n zenko</code>

Helm List:

<code>helm list -n zenko</code>

Helm Upgrade:

<code>helm upgrade --set namespece=zenko zenko -f ./zenko/values.yaml ./zenko -n zenko</code>

Helm Uninstall:

<code>helm uninstall zenko -n zenko</code>