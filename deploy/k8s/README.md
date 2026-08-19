# P10 talent-web Kubernetes manifests

Deployment / Service（ポート 3010）。API は cluster 内 `http://api.p10.svc.cluster.local:8090`。

Ingress は `pf-cloud-k8s`:

- `talent.localhost` → web
- `talent-api.localhost` → api

メモリ API のまま。platform Postgres へは移行しない。
