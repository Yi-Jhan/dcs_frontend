## Installing the Chart

To install the chart with the release name `redis` in namespace -n dcs:

```console
helm install redis -f values.yaml oci://registry-1.docker.io/bitnamicharts/redis -n dcs
```

## Upgrding the Chart

To upgrade the chart with the release name `redis` in namespace -n dcs:
```console
helm upgrade redis -f values.yaml -n dcs
```

## Rollback the Chart

To rollback the chart with the release name `redis` to previous in namespace -n dcs:
```console
helm rollback redis -f values.yaml -n dcs
```


## Uninstalling the Chart

To uninstall/delete the `redis` deployment:

```console
helm delete redis -n dcs
```

