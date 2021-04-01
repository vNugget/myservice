# Overview
Metallb is a component which provides load balancing services for an on-premise Kubernetes cluster.
Metallb can de deployed and configured in two distinct modes:
1. Layer-2: in which case all initial ingress requests for services are processed by a single node. This works more in a high-availability capacity than a true load balancer.  ARP requests are used to advertise network configuration.
2. BGP: in which case network routes are advertised to BGP compatible routers and all worker nodes in the k8s cluster participate in load balancing incoming requests for services. **Note that this mode may conflict with calico BGP configuration**.

Karbon FastTrack deploys Metallb in **layer-2 mode**.
# Instructions
In order to deploy metallb on a new k8s cluster, you will need to:
1. Apply the install manifest which will create the metallb-system namespace, all required custom resource definitions (CRDs), cluster role, cluster role binding, daemonsets and deployments.  Note that metallb has a controller and a speaker component.  **You do not need to edit this install manifest**.
2. Edit the configure manifest to include one or more IP ranges for metallb to use when assigning public IPs to services defined as type LoadBalancer.  **This IP range should be in the same VLAN and subnet as the cluster nodes**.

To install the metallb components, use the following command:
```bash
kubectl apply -f ./manifests/lb-metallb-install.yaml
```
Now edit the configuration file with your IPv4 address range by using the following command:
```bash
vi ./manifests/lb-metallb-configure.yaml
```
Finally, apply the metallb configuration using the following command:
```bash
kubectl apply -f ./manifests/lb-metallb-configure.yaml
```
# Testing the component
In order to verify that metallb components have been deployed successfully, run the following command:
```bash
kubectl -n metallb-system get all
```
We will now deploy a simple web application (consisting of a browser based pacman game) in order to test the metallb load balancing services.
Deploy the pacman test application using the following command:
```bash
kubectl apply -f ./manifests/app-test-pacman.yaml
````
Use this command to see which external IP was assigned to the pacman service:
```bash
kubectl get svc
```
Open a web browser to http:{{external_ip_of_the_pacman_service}}. You should see a pacman game interface.
Once you have successfully tested the pacman application, you can remove the service by using the following command:
```bash
kubectl delete -f ./manigests/app-test-pacman.yaml
```

# Troubleshooting