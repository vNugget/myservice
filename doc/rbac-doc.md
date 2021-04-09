# RBAC Implementation

- [RBAC Implementation](#rbac-implementation)
- [GETTING STARTED](#getting-started)
  - [RBAC Roles and Role Binding](#rbac-roles-and-role-binding)
  - [RBAC Roles Aggregation](#rbac-roles-aggregation)
  - [Creating Users in Karbon](#creating-users-in-karbon)
  - [Creating Roles](#creating-roles)
    - [Developer](#developer)
    - [Operator](#operator)
    - [Network Admin](#network-admin)
    - [Service Owner](#service-owner)
    - [Role Aggregation Use case](#role-aggregation-use-case)
      - [**Step 1**:](#step-1)
      - [**Step 2**:](#step-2)
      - [**Step 3**:](#step-3)
      - [(Optional) **Step 4**::](#optional-step-4)

# GETTING STARTED

This guide detail different use cases of Kubernetes RBAC to handle different IT roles, the roles described in this guide can be used as a template or for future customization depending on the customer requirements.

Some specifique operation are related to Karbon only and can't be used on a vanilla Kubernetes deployement, this will be clarified on the affected section.

The first section of this guide will give a breif description of different RBAC directives and how to combine them (aggregation) to add more specific permissions to the final user, following this part you will create a user that will be used during this guide, the same logic can be used on customer environement with light customization.

Use of the described roles below is not a hard requirement, they are given as an example.

You will use a ficticious user named **salah_user**.

## RBAC Roles and Role Binding

There is two types of roles on a Kubernetes cluster:
- **Role**: a Role always sets permissions within a particular namespace; when you create a Role, you have to specify the namespace it belongs in.
- **ClusterRole**: are non-namespaced resource that can be used to grant permission on namspaced resources or cluster wide.

In this guide you will be using ClusterRole only, this will give you the flexibility to use them cluster wide or scoped to a namspace, another advantage is building ClusterRole this way will allow you to define RBAC in a modular way, for ease of use, code resue and easy troubleshooting.

## RBAC Roles Aggregation

From kubernetes.io documentation:

>You can aggregate several ClusterRoles into one combined ClusterRole. A controller, running as part of the cluster control plane, watches for ClusterRole objects with an aggregationRule set. The aggregationRule defines a label selector that the controller uses to match other ClusterRole objects that should be combined into the rules field of this one.

## Creating Users in Karbon

The assumption here is that you have some users on your Active Directory, you will use Role mapping from Prism Central to map you user **salah_user** into the **viewer** role as shown on the screenshot below:

The next steps is to generate a **kubeconfig** file for your user, this can be done using Prism Central web interface, API or karbonctl, in our case, you will be using karbonctl.

> Note: Kubeconfig is valid for 24 hours once pulled. This is a security feature by design in Karbon. A fresh and valid kubeconfig can be obtained using a cronjob that use karbonctl to retrieve the kubeconfig file.

Start by connecting to PC using ssh, then use karbonctl to extract the **kubeconfig** file in a YAML format:

    PCVM:~$ ~/karbon/karbonctl login --pc-ip <Prism_Central_IP> --pc-username <salah_user@emeagso.lab>
    Please enter the password for the PC user: salah_user@emeagso.lab  ********
    Login successful

Export the kubeconfig and tranfert it into your user machine

    PCVM:~$ ~/karbon/karbonctl cluster kubeconfig --cluster-name salah-dev > salah_user.kubeconfig

## Creating Roles

In this guide you have 4 roles that can be used as a template or with a little bit of customization.

You will be using **rbac-base-role.yaml** as a starting point, you can use this role and combine it with other roles to create a more sophisticated role.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: base-role
aggregationRule:
  clusterRoleSelectors:
  - matchLabels:
      rbac.example.com/aggregate-to-base-role: "true"
rules: [] # The control plane automatically fills in the rules
```

The base role is an aggregated ClusterRole, if you create a new ClusterRole that matches it label selector any rules defined on the child ClusterRole will get automatically addedd into the parent ClusterRole **rbac-base-role.yaml**

To enable this, you have to add a label into the child ClusterRole yaml definition file, for example:

```yaml
labels:
    rbac.example.com/aggregate-to-base-role: "true"
```

### Developer

The developer role is defined in **[rbac-developer.yaml](../manifests/rbac-developer.yaml)**, it grant the user the typical permissions needed to manage an application (pods, deployment, configmap...) inside a specifique namespace.

The possibility to manage roles, network policies or deamonsets for example is not granted for this user.

### Operator

Operator is defined in **[rbac-operator.yaml](../manifests/rbac-operator.yaml)**, is it aggregated from it parent ClusterRole **view**, **view** ClusterRole is a predefined role that is added during Kubernetes installation.

Operator allows read-only access to see most objects in a namespace. It does not allow viewing roles or role bindings.

This role does not allow viewing Secrets, since reading the contents of Secrets enables access to ServiceAccount credentials in the namespace, which would allow API access as any ServiceAccount in the namespace (a form of privilege escalation).

### Network Admin

To have more flexibility and control over the Kubernetes networking stack, clusters are created using Calico as a CNI.

A network admin is a person responsible for configuring and operating the Calico network as a whole. As such, they will need access to all Calico custom resources, as well as some associated Kubernetes resources.

Network Admin is defined in **[rbac-network-admin.yaml](../manifests/rbac-network-admin.yaml)**.

### Service Owner

A service owner is a person responsible for operating one or more services in Kubernetes. They should be able to define network policy for their service, but don’t need to view or modify any global configuration related to Calico.

This ClusterRole can be combined with the **developer** ClusterRole to give the possibility to the developper teams to create a network policy for their pods/deployment scoped into a specifique namespace.

Service Owner is defined in **[rbac-service-owner.yaml](../manifests/rbac-service-owner.yaml)**.

### Role Aggregation Use case

Suppose that you have a project to develope an application in the namespace **dev**, developpers needs to have the flexibility to deploy, manage, update, delete ressources only on their **dev** namespace.

#### **Step 1**:

Start by creating the developer account as seen on the section [Creating Users in Karbon](#creating-users-in-karbon)

#### **Step 2**:

In this step, you will create a namespace, the base ClusterRole and the developer ClusterRole.

The base role can be renamed to reflect it's purpose, for example, you can rename it: dev-base-cr.yaml.


- Create the namespace:

        kubectl create ns dev

- Apply the **[rbac-base-role.yaml](../manifests/rbac-base-role.yaml)**

        kubectl apply -f rbac-base-role.yaml

- Apply the **[rbac-developer.yaml](../manifests/rbac-developer.yaml)**

        kubectl apply -f rbac-devloper.yaml

- Verify the permission on the base ClusterRole
  
        kuebctl describe clusterrole base-role

#### **Step 3**:

Create a RoleBinding that bind the developer (Karbon) user account into the ClusterRole **base-role**. Don't forget the namespace name.

    kubectl create rolebinding dev-binding --clusterrole=base-role --user=salah_user@emeagso.lab --namespace dev

Let's verify if the developer user can create network policies in the **dev** namespace (using it's kubeconfig file):

    kubectl apply -f network-policy-deny-ingress.yaml -n dev --kubeconfig=../../../salah_user.kubeconfig

    Error from server (Forbidden): error when retrieving current configuration of:
    Resource: "networking.k8s.io/v1, Resource=networkpolicies", GroupVersionKind: "networking.k8s.io/v1, Kind=NetworkPolicy"
    Name: "default-deny-ingress", Namespace: "dev"
    from server for: "network-policy-deny-ingress.yaml": networkpolicies.networking.k8s.io "default-deny-ingress" is forbidden: User "salah_user@emeagso.lab" cannot get resource "networkpolicies" in API group "networking.k8s.io" in the namespace "dev"

As expected, the developer role doesn't have this possibility.

At this stage, anytime you want to grant the developer additional permissions, you only have to apply a definition file with the correct label and it will be merged with the **base role**, no additional role binding is necessary (see **Step 4**).


 #### (Optional) **Step 4**::

If you want to give the developer user the possibility to manage network policies for example, you can use the **[rbac-service-owner.yaml](../manifests/rbac-service-owner.yaml)** file, start by uncommenting this section:

```yaml
  #labels:
    #rbac.example.com/aggregate-to-base-role: "true"
```

Now lets grant this user the right to create network policies for their pods inside the namespace **dev**:

    kubectl apply -f rbac-service-owner.yaml

Verifying that he can create the network policy:

    kubectl apply -f network-policy-deny-ingress.yaml -n dev --kubeconfig=../../../salah_user.kubeconfig
    networkpolicy.networking.k8s.io/default-deny-ingress created

The service owner ClusterRole got merged with the **base-role**: service owner -> base role.

Remeber! that the developer ClusterRole also got merged in the same way: developer -> base role

***Result: service owner + developer = base role***


