## Installing the Chart

To install the chart with the release name `postgresql` in namespace -n dcs:

```console
helm install postgresql -f values.yaml oci://registry-1.docker.io/bitnamicharts/postgresql -n dcs
```

## Upgrding the Chart

To upgrade the chart with the release name `postgresql` in namespace -n dcs:
```console
helm upgrade postgresql -f values.yaml -n dcs
```

## Rollback the Chart

To rollback the chart with the release name `postgresql` to previous in namespace -n dcs:
```console
helm rollback postgresql -f values.yaml -n dcs
```


## Uninstalling the Chart

To uninstall/delete the `postgresql` deployment:

```console
helm delete postgresql -n dcs
```

