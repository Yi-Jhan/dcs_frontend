## Installing the Chart

To install the chart with the release name `rabbitmq` in namespace -n dcs:

```console
helm install rabbitmq -f values.yaml oci://registry-1.docker.io/bitnamicharts/rabbitmq -n dcs
```

## Upgrding the Chart

To upgrade the chart with the release name `rabbitmq` in namespace -n dcs:
```console
helm upgrade rabbitmq -f values.yaml -n dcs
```

## Rollback the Chart

To rollback the chart with the release name `rabbitmq` to previous in namespace -n dcs:
```console
helm rollback rabbitmq -f values.yaml -n dcs
```


## Uninstalling the Chart

To uninstall/delete the `rabbitmq` deployment:

```console
helm delete rabbitmq -n dcs
```
