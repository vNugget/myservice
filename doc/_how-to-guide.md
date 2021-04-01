# Overview
Karbon FastTrack is a services offering designed to enable Karbon in a customer environment and provision a number of essential Kubernetes additional components.
Use this repository on a new Karbon deployed k8s cluster to install & configure all the ecosystem components included in the Karbon FastTrack offering.

Manifests in the "manifest" folder should be applied in this order:
1. [metallb](https://github.com/nutanix-enterprise/consulting-pracdev-karbon-fasttrack/blob/v1/doc/lb-metallb-doc.md "metallb")
2. [traefik](https://github.com/nutanix-enterprise/consulting-pracdev-karbon-fasttrack/blob/v1/doc/ingress-traefik-doc.md "traefik")
3. [rbac](https://github.com/nutanix-enterprise/consulting-pracdev-karbon-fasttrack/blob/v1/doc/rbac-doc.md "rbac")
4. [k10](https://github.com/nutanix-enterprise/consulting-pracdev-karbon-fasttrack/blob/v1/doc/backup-k10-doc.md "k10")
5. [gitlab](https://github.com/nutanix-enterprise/consulting-pracdev-karbon-fasttrack/blob/v1/doc/registry-gitlab-doc.md "gitlab")
6. [jenkins](https://github.com/nutanix-enterprise/consulting-pracdev-karbon-fasttrack/blob/v1/doc/ci-jenkins-doc.md "jenkins")
7. [prometheus](https://github.com/nutanix-enterprise/consulting-pracdev-karbon-fasttrack/blob/v1/doc/monitoring-prometheus-doc.md "prometheus")
8. [efk](https://github.com/nutanix-enterprise/consulting-pracdev-karbon-fasttrack/blob/v1/doc/logging-efk-doc.md "efk")

To start, you will need to clone this repository locally on the system you will use to deploy this offering.
Create a local directory (such as 'github') on your workstation, then use the following command to clone this repository:

```bash
git clone https://{{your_github_username}}:{{your_github_access_token}}@github.com/nutanix-enterprise/consulting-pracdev-karbon-fasttrack
```