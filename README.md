## RAG-as-a-Service

### Frontend server

### langflow base

langflow base version: [1.4.0](https://github.com/langflow-ai/langflow/releases/tag/1.4.0)

---


### Deploy Frontend Image (Cloud Run)

#### Dockerfile (frontend/Dockerfile)
```dockerfile
FROM --platform=$BUILDPLATFORM node:lts-bookworm-slim as builder-base

WORKDIR /frontend
COPY package*.json .
RUN npm ci

COPY . .

COPY ./set_proxy.sh .
RUN chmod +x set_proxy.sh && \
    cat set_proxy.sh | tr -d '\r' > set_proxy_unix.sh && \
    chmod +x set_proxy_unix.sh && \
    ./set_proxy_unix.sh

ENV NODE_OPTIONS=--max_old_space_size=4096

RUN npm run build


FROM nginxinc/nginx-unprivileged:stable-bookworm-perl as runtime

ENV BACKEND_URL=https://imgenie-rag-backend-v3-412195401920.asia-east1.run.app

COPY --from=builder-base --chown=nginx /frontend/build /usr/share/nginx/html
COPY --chown=nginx ./docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx ./docker/frontend/start-nginx.sh /start-nginx.sh
RUN chmod +x /start-nginx.sh
ENTRYPOINT ["/start-nginx.sh"]
```

#### 1. Navigate to the Frontend Directory
```shell
cd ./frontend
```

#### 2. Build Docker Image
```shell
docker build -t asia-east1-docker.pkg.dev/csdfm-lab/flaskapp-trail-run/langflow-frontend-v4 .
```

#### 3. Push Docker Image to Artifact Registry
```shell
docker push asia-east1-docker.pkg.dev/csdfm-lab/flaskapp-trail-run/langflow-frontend-v4
```

---

### Deployment Configuration

- **Port:** `80`
- **Environment Variable:**  
  `BACKEND_URL=https://imgenie-rag-backend-v4-412195401920.asia-east1.run.app`


---

### Deployment Features

#### 1. Deployment Webhook Configuration
**File:** `frontend/src/modals/flowDeployModal/index.tsx`
```ts
const url = "https://cloudbuild.googleapis.com/v1/projects/csdfm-lab/locations/asia-east1/triggers/ifhir-flow-api:webhook?key=AIzaSyDUJgjVZZYrBjUwChruUWBkN_4uFNnx97E&secret=wVnKfCWo6RuTPv2TScj9t-5lnzdXoIU4&trigger=ifhir-flow-api&projectId=csdfm-lab";
```
```ts
const body = {
  service_name: newFlow.name,
  flow_id: currentFlow.id,
};
```
- `service_name` : The name used during deployment
- `flow_id` : The ID of the current flow

#### 2. Healthcheck API
**File:** `frontend/src/modals/flowDeployModal/index.tsx`
```ts
const healthUrl = `https://${newFlow.name}-412195401920.asia-east1.run.app/health`;
```
- `newFlow.name` : The name used during deployment

Check deployment status:
```ts
axios.get(healthUrl)
    .then((response) => {
        if (response.status === 200) {
            const revision = response.data.revision || "";
            health = {
                title: `Deploying ${currentFlow.name}  Please wait ...`,
                progress,
                returnUrl: `https://${newFlow.name}-412195401920.asia-east1.run.app`,
                starttime: Date.now(),
                flowid: currentFlow.id,
                revision: revision,
                name: currentFlow.name
            };
        }
    })
    .catch((err) => {
        console.log("Health check failed", err);
    })
```

#### 3. Wait for Deployment Success by polling
**File:** `frontend/src/alerts/alertDropDown/components/singleAlertComponent/index.tsx`
```ts
useEffect(() => {
  if (type === "progress") {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 99) {
          const healthUrl = `${dropItem.returnUrl}/health`;
          const checkRevision = () => {
            axios.get(healthUrl)
                    .then((response) => {
                      if (response.status === 200) {
                        const fetchedRevision = response.data.revision;
                        if (fetchedRevision !== dropItem.revision) {
                          setShow(false);
                          removeAlert(dropItem.id);
                          clearInterval(interval);
                          setSuccessData({ title: `${dropItem.name} Deployed Successfully.`, returnUrl: dropItem.returnUrl });
                        }
                      }
                    })
                    .catch((err) => {
                      console.log("Health check failed", err);
                    });
          };
          checkRevision();
          return 99;
        }
        return calculateProgress();
      });
    }, 1000);

    return () => clearInterval(interval);
  }
}, [type]);
```

If the service already exists before deployment, the system checks whether the deployment is successful by comparing the `revision` value from the `/health` endpoint.

#### Example

**Before Deployment:**
```json
{
  "service": "basic-rag-search-from-vector-store-3",
  "db_health": true,
  "port": "8080",
  "revision": "basic-rag-search-from-vector-store-3-00001-spm"
}
```

**After Deployment:**
```json
{
  "service": "basic-rag-search-from-vector-store-3",
  "db_health": true,
  "port": "8080",
  "revision": "basic-rag-search-from-vector-store-3-00002-98j"
}
```