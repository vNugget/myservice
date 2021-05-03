# Overview
Karbon FastTrack is a services offering designed to enable Karbon in a customer environment and provision a number of essential Kubernetes additional components.
Use this repository on a new Karbon deployed k8s cluster to install & configure all the ecosystem components included in the Karbon FastTrack offering.

There is two methods to use this repository:

1. **Manualy**: this require deploying the manifests according to the documentation in the [doc](../doc/) folder
2. **Automagically**: this is the recommended way, refer to the requirements section

Manifests in the "manifest" folder should be applied in this order:
1. [metallb](https://github.com/nutanixservices/cita-ft-karbon/blob/nx-sbourdeaud_SDCD-2632/doc/lb-metallb-doc.md "metallb")
2. [traefik](https://github.com/nutanixservices/cita-ft-karbon/blob/nx-sbourdeaud_SDCD-2632/doc/ingress-traefik-doc.md "traefik")
3. [rbac](https://github.com/nutanixservices/cita-ft-karbon/blob/nx-sbourdeaud_SDCD-2632/doc/rbac-doc.md "rbac")
4. [k10](https://github.com/nutanixservices/cita-ft-karbon/blob/nx-sbourdeaud_SDCD-2632/doc/backup-k10-doc.md "k10")
5. [gitlab](https://github.com/nutanixservices/cita-ft-karbon/blob/nx-sbourdeaud_SDCD-2632/doc/registry-gitlab-doc.md "gitlab")
6. [jenkins](https://github.com/nutanixservices/cita-ft-karbon/blob/nx-sbourdeaud_SDCD-2632/v1/doc/ci-jenkins-doc.md "jenkins")
7. [prometheus](https://github.com/nutanixservices/cita-ft-karbon/blob/nx-sbourdeaud_SDCD-2632/doc/monitoring-prometheus-doc.md "prometheus")
8. [efk](https://github.com/nutanixservices/cita-ft-karbon/blob/nx-sbourdeaud_SDCD-2632/doc/logging-efk-doc.md "efk")

To start, you will need to clone this repository locally on the system you will use to deploy this offering.
Create a local directory (such as 'github') on your workstation, then use the following command to clone this repository:

```bash
git clone https://{{your_github_username}}:{{your_github_access_token}}@github.com/nutanix-enterprise/consulting-pracdev-karbon-fasttrack
```
# Schema and description here / scenario covered by this guide

# Requirements


## Setting the required variables

Some variables and secrets are required to use this repository and and it's Github Action workflow, after cloning the repository, create the following secrets on Github
**Settings** => **Secrets** => **Actions**
- **DO_AUTH_TOKEN**: this is the API token that will be used to interact with DigitalOcean to handle DNS records
- **SLACK_INCOMING_WEBHOOK**: the webhook that will be used by Github Action to notify you about the status of the workflow
- **KUBECONFIG**: for CI/CD pipeline it is recommended to create a service account with appropriate rights on the destination cluster, please refer to the following [KB7357](https://portal.nutanix.com/kb/000007357).
The result of this kubeconfig file is what makes the content of this variable, you can use the bellow command:

    $ cat kubeconfig | base64 | tr -d "\n"
    IyAtKi0gbW9kZTogeWFtbDsgLSotCiMgdmltOiBzeW50YXg9eWFtbAojCmFwaVZlcnNpb246IHYxCmtpbmQ6IENvbmZpZwpjbHVzdGVyczoKLSBuYW1lOiBzYWxhaC1kZXYKICBjbHVzdGVyOgogICAgc2VydmVyOiBodHRwczovLzEwLjY4Ljk5Ljk6NDQzCiAgICBjZXJ0aWZpY2F0ZS1hdXRob3JpdHktZGF0YTogTFMwdExTMUNSVWRKVGlCRFJWSlVTVV
    ....
    ....
    ....

## MetalLB Configuration

To deploy and use metallb correctly, you will need to specify the ip addresses range that can be used by Traefik and other services (if required), those services are of type **LoadBalancer**.

**[config.json](../manifests/config.json)** is located in the manifests directory, this file will host all the variable that need to be used to cutomize the deployment.
In the case of metallb, you will have to change the variable **cidr** to be in the bellow format:
```json
10.68.99.xx-10.68.99.xx
Or
10.68.99.xx/xx
```

## Traefik Customization

Traefik yaml **[manifets](../manifests/traefik-deployment.yaml)** by default use Let's Encrypt staging server to issue TLS certificates, this to allow for testing certificates issuance and testing without hitting Let's Encrypt requests limit.

When you have finished all the testing, replace this line:

    - --certificatesresolvers.myresolver.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory

With this line:

    - --certificatesresolvers.myresolver.acme.caserver=https://acme-v02.api.letsencrypt.org/directory

## Setting-up the Github Runner

This repository use Github Actions to automate the CICD part, you will need to setup a runner according to Github instructions at **Settings** => **Actions** => **Add runner**