[[_TOC_]]

# [ServiceName] [version]

Current certification:
| Workload Rating | Certified For
| - | -
| Environments | `Laboratory` `Development` `Test` `Acceptance` `Production`
| Data | `S0` `S1` `S2`

[![Build Status](https://dev.azure.com/arq-des-repsol/CloudCompetenceCenter/_apis/build/status/Yaml/[ServiceName][version]?branchName=master)](https://dev.azure.com/arq-des-repsol/CloudCompetenceCenter/_build/latest?definitionId=xxx&branchName=master) <The full markdown link can be obtained from build pipeline, in the "Status badge" option>

## 1. Introduction

### 1.1. Service Description

<Azure description of the Service + links>

In this version of the Certified Service, the [Azure Services involved] will be deployed with the following features:

+ <Description of what has been implemented in this Certified Service (what can be done)>
+ etc

### 1.2. Release Notes

**[2018.10.09] <Certified Service Name> <Version> preview <preview number> (current version)**

> + <What has been implemented>

[2018.09.18] <Certified Service Name> <Version> preview <preview number - 1>

> + <What has been implemented>

## 2. Architecture

### 2.1. High Level Design

![High Level Design](<Link to High Level Diagram>)

The following Azure Services will be deployed in this Certified Service:

+ <Azure Services and link>

### 2.2. Network Design

![High Level Design](<Link to Network Diagram>)

### 2.3. Consumption endpoints (Data plane)

Once deployed, this Certified Service can be accessed by other Services via the following consumption endpoint(s):

| Consumption Endpoint (Data plane) | Port
| - | -
| <URL of the exposed Consumption endpoint> | <Port>

The following links in the Azure documentation give more information about these endpoints:
    + [Link 1 title](link-1)
    + etc

#### 2.3.1. Endpoint Access

The [Service] will be deployed with the [firewall enabled by default](link-to-firewall-related-documentation). Allowing access to this endpoint can be done by adding Allow rules to the firewall:

| Access type | How access can be allowed | Prerequisites
| - | - | -
| **Public Access** | - | -
| **Private Access** | - | -
| **Azure Services Access** | - | -

#### 2.3.2. Endpoint Authorization and Authentication

The access to the exposed endpoints will be authenticated and authorized according to the following table:

| Endpoint (Data Plane) | Authentication | Authorization
| - | - | -
| <URL of the consumption endpoint> | <How Authentication needs to be done (RBAC/User + Password from Key Vault)> | <How Authorization can be granted>

### 2.4. Service Limits

+ <What cannot be done in this version of the service>
+ etc

## 3. Service Provisioning

### 3.1. Prerequisites

The following Azure resources need to be in place before this Certified Service can be provisioned:

+ <Prerequisite>

### 3.2. Deployment parameters

| Name | Description | Type | Is mandatory | Default Value | Allowed Values | Limits | Schema | Notes
| - | - | - | - | - | - | - | - | -
| {NameOfParameter} | {Description} | {string | boolean | string[] | hashtable[] | etc } | {yes | no} | `{defaultvalue}` | `{value1}`, `{value2}`, `{etc}` | {Limits} | {Schema} | {Notes}
| ExampleOfComplexParamterToGrantPermissions | A list of [Key Vault Access Policies](https://docs.microsoft.com/en-us/azure/key-vault/key-vault-secure-your-key-vault#key-vault-access-policies) that will allow to grant data plane permissions on Key Vault Items (keys, secrets and certificates) | hashtable[] | no | - | - | - | Each element of the array is a hashtable that must meet the following schema: {::nomarkdown}<ul><li>**`"objectId"`**' : '*`"string"`*. The Email, Display Name or Object Id of the Azure AD principal to be granted with permissions</li><li>**`"permissions"`**`:`*`{hashtable}`*. A hashtable with the following elements:<ul><li>**`"keys"`**`:`*`"string"`*. The permissions to be granted to the [Key Vault keys](https://docs.microsoft.com/en-us/azure/key-vault/about-keys-secrets-and-certificates#key-access-control) (`get`, `list`, `update`, `create`, `import`, `delete`, `recover`, `backup`, `restore`, `decrypt`, `encrypt`, `unwrapKey`, `wrapKey`, `verify`, `sign`, `purge`, `all`)</li><li>**`"secrets"`**`:`*`"string"`*. The permissions to be granted to the [Key Vault secrets](https://docs.microsoft.com/en-us/azure/key-vault/about-keys-secrets-and-certificates#secret-access-control) (`get`, `list`, `set`, `delete`, `recover`, `backup`, `restore`, `purge`, `all`)</li><li>**`"certificates"`**`:`*`"string"`*. The permissions to be granted to the [Key Vault certificates](https://docs.microsoft.com/en-us/azure/key-vault/about-keys-secrets-and-certificates#certificate-access-control) (`get`, `list`, `update`, `create`, `import`, `delete`, `recover`, `backup`, `restore`, `managecontacts`, `manageissuers`, `getissuers`, `listissuers`, `setissuers`, `deleteissuers`, `purge`, `all`)</li><li>**`"storage"`**`:`*`"string"`*. The permissions to be granted to the [Managed Storage Account](https://docs.microsoft.com/en-us/azure/key-vault/about-keys-secrets-and-certificates#storage-account-access-control) (`get`, `list`, `update`, `delete`, `recover`, `backup`, `restore`, `set`, `regeneratekey`, `getsas`, `listsas`, `deletesas`, `setsas`, `purge`)</li></ul></li></ul>{:/} | E.g. of valid value: `[{"objectId" : "r.lopez@servexternos.repsol.com","permissions" : {"keys" : ["Get", "List"],"secrets" : ["Get","List"],"certificates" : ["Get","List"],"storage" : []}},{"objectId" : "4fc0433b-f6a1-4a90-b5f6-b59ac591d0f8","permissions" : {"keys" : ["Get","List"],"secrets" : ["List"],"certificates" : ["All"],"storage" : []}}]"`
| ExampleOfParameterRelatedToFirewallAllowMicrosoftServices | Allows [trusted Microsoft services](link-to-azure-documentation) to bypass the firewall.\nTrusted services include: {::nomarkdown}<ul><li>Azure Virtual Machine Deployment Service</li><li>Azure Resource Manager Template Deployment Service</li><li>Azure Disk Encryption volume encryption service</li><li>Azure Backup</li><li>Exchange Online</li><li>SharePoint Online</li><li>Azure Information Protection</li><li>Azure App Service: Web App</li><li>Azure SQL</li><li>Azure Storage</li><li>Azure Data Lake Storage</li></ul>{:/} | boolean | no | `false` | - | - | - | -
| ExampleOfParameterRelatedToFirewallAllowedPublicIPs | Grant access to traffic from specific public [internet IP address ranges](link-to-azure-documenation) | string[] | no | - | - | - | Each element of the array is a `string` that must meet one of the following formats: {::nomarkdown}<ul><li>Single IP (e.g. `"195.53.125.0"`)</li><li>CSV of IPs (e.g. `"195.53.125.0,195.53.125.120"`)</li><li>CIDR (e.g. `"195.53.125.0/24"`)</li><li>Range of IPs (e.g. `"195.55.119.5-195.55.119.60"`)</li></ul>{:/} | E.g. of valid value: `["195.53.125.0","195.53.125.0,195.53.125.120","195.53.125.0/24","195.55.119.5-195.55.119.60"]`
| ExampleOfParameterRelatedToFirewallAllowedSubnets | Grant access to traffic from specific [Azure virtual networks](link-to-azure-documentation) | hashtable[] | no | - | - | - | Each element of the array is a hashtable that must meet the following schema: {::nomarkdown}<ul><li>**`"VNetSubscriptionId"`**`:`*`"string"`*. The subscription of the Virtual Network to be allowed</li><li>**`"VNetResourceGroupName"`**`:`*`"string"`*. The Resource Group of the Virtual Network to be allowed</li><li>**`"VNetName"`**`:`*`"string"`*. The name of the Virtual Network to be allowed</li><li>**`"VNetSubnetName"`**`:`*`"string"`*. The name of the Subnet to be allowed</li></ul>{:/} | Prerrequisites: {::nomarkdown}<ul><li>The Virtual Network subnet must have the [`Azure Key Vault` service endpoint enabled](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-network-service-endpoints-overview)</li><li>The Deployment Service principal must have the RBAC permission [`Microsoft.Network/JoinServicetoaSubnet` granted on the Virtual Network subnet](https://docs.microsoft.com/en-us/azure/role-based-access-control/resource-provider-operations#microsoftnetwork)</li></ul>{:/}E.g. of valid value: `[{"VNetSubscriptionId" : "0a25214f-ee52-483c-b96b-dc79f3227a6f","VNetResourceGroupName" : "EngineeringServiceTests","VNetName" : "testreleasevnet","VNetSubnetName" : "testreleasevnet",},{"VNetSubscriptionId" : "0a25214f-ee52-483c-b96b-dc79f3227a6f","VNetResourceGroupName" : "testsubnet10tests","VNetName" : "testvnet","VNetSubnetName" : "testsubvnet"}]`

The following parameters file serves as Schema for the parameters described in the table above

```json
JSON example parameters file
```

### 3.3. Outputs & Secrets

#### 3.3.1. Outputs

The following Outputs will be created as a result of Service Provisioning

| Output type | Variable default name | Parameter to customize the variable name | Schema | Description
| - | - | - | - | -
|  [Azure DevOps Release Variable](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/variables?view=vsts&tabs=powershell#set-in-script) / Key Vault secret | CCCOutput-<serviceChars>-`{ServiceName}`-<variableDefaultName> | `ParameterName` | Comma-sepparated list of quoted IPs (e.g. `"192.168.2.1","10.0.0.2"`) | <Describe>

#### 3.3.2. Secrets

The following elements will be stored as Key Vault secrets

| Key Vault Name | Secret default name | Parameter to customize the secret name | Schema | Description
| - | - | - | - | -
`<ServiceName>`kv | CCCOutput-<serviceChars>-`<MySqlDatabaseName>`-<secretDefaultName> | `ParameterName` | Regular string (e.g. `Admin`) | Admin User of My SQL Server

### 3.4. Validated Use Cases

+ [[Use Case category] | [Use Case 1 title]](link-to-use-case-documentation-in-CCCSamples)
+ [[Use Case category] | [Use Case N title]](link-to-use-case-documentation-in-CCCSamples)

## 4. Service Decommissioning

### 4.1. Prerequisites

The following Azure resources need to be in place before this Certified Service can be decommissioned:

+ <Prerequisite>

### 4.2. Decommissioning parameters

| Name | Description | Type | Is mandatory | Default Value | Allowed Values | Limits | Schema | Notes
| - | - | - | - | - | - | - | - | -
| {NameOfParameter} | {Description} | {string | boolean | string[] | hashtable[] | etc } | {yes | no} | `{defaultvalue}` | `{value1}`, `{value2}`, `{etc}` | {Limits} | {Schema} | {Notes}

The following parameters file serves as Schema for the parameters described in the table above

```json
JSON example parameters file
```

## 5. Security Framework: Digital Case Responsibilities

### 5.1. Responsibilities for S0 rated workloads

The Digital Case must implement the following controls for S0 rated workloads. The rest of the controls are covered by using this Certified Service:

| ID | Control Name | How
| - | - | -
| F1 | IAM on all accounts and resources | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| F2 | Owner/cost tagging for all resources | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| F3 | Platform Audit Logs & Platform Security Monitoring | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| F4 | Monitor and assess updated CSP Service Terms and Audit Reports | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| F5 | Virus/Malware protection | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| F6 | CSP Public Names | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>

### 5.2. Responsibilities for S1 rated workloads

The Digital Case must implement the following controls for S1 rated workloads. The rest of the controls are covered by using this Certified Service:

| ID | Control Name | How
| - | - | -
| S1-1 | MFA on all user accounts | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-2 | Infrastructure as code | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-3 | Declarative configuration management | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-4 (N1) | Control routing path and monitor outbound traffic from CSP Private to CSP Public and/or internet. | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-4 (N2) | Control routing path and monitor outbound from CSP Private to Repsol On-premises | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-4 (N3) | Control routing path and monitor inbound traffic from CSP Public to Repsol private networks | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-4 (N4) | Control routing path and monitor inbound traffic from Internet to CSP Public  | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-4 (N5) | Allow only desired network protocols from Internet | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-4 (N6) | Control routing path and monitor between CSP Services | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-5 | Only Repsol approved & authorized services can be deployed | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-6 | Only vendor supported OS and application versions | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-7 | Automated & enforced patch Management | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-8 | Periodic vulnerability scanning (including credential based) | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S1-9 (D1) | Encrypt data in transit over public interconnections | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S9 (D2) | Encrypt data at rest | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S9 (D3) | Data Leakage must be prevented | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S10 (A1) | Security & Event Monitoring and event correlation incl. Application Audit Logs | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S10 (A2) | Guarantee the integrity of cloud events on CSP | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S11 | Secure applications on application level, use ASE if application level security is not guarantee | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S12 | Non-Used environments should be deleted | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>

### 5.3. Responsibilities for S2 rated workloads

The Digital Case must implement the following controls for S2 rated workloads. The rest of the controls are covered by using this Certified Service:

| ID | Control Name | How
| - | - | -
| S2-1 | Isolation on application network tier level (single application containment) by exception only | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S2-2 | Secure Service publishing (Layer 7 inspection) | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S2-3 | Application security events (e.g. modified security settings) and exceptions must be logged | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S2-4 | Encrypt data in transit over public and private interconnections | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>
| S2-5 | Use trusted registries for containers images | <copy content of column 'Who is accountable' of Service Description document. If this control is not responsibility of the Digital Case, remove>

## 6. Service Operation

### 6.1. Monitoring

The Devops Operator must be able to access to the logs stored in the centralized StorageAccount used for Application Logs (App Insights and App Services).

The guidance to understand how this logs can be consumed can be found in the wiki of the [cccsamples01](https://repsol-digital-team.visualstudio.com/CCCSamples01/_wiki/wikis/CCC%20Samples?pagePath=%2FWelcome&pageId=890&wikiVersion=GBwikiMaster) Azure DevOps project

The following Logs and Metrics will be sent to the Log Analytics workspace for Acceptance and Production environments

| Azure Service | Log Kind | Log / Metric / Where
| - | - | -
| [Azure Service 1] | [Diagnostics Logs](link to azure related documentation) | [<Log Name 1> ](link to azure related documentation)
| - | | [<Log 2>](link to azure related documentation)
| - | [Metrics](link to azure related documentation) | [<Metric Name 1>](link to azure related documentation)
| - | - | [<Metric Name 2>](link to azure related documentation)
| [Azure Service 2] | [Diagnostics Logs](link to azure related documentation) | [<Log Name 1> ](link to azure related documentation)
| - | - | [<Log 2>](link to azure related documentation)
| - | [Metrics](link to azure related documentation) | [<Metric Name 1>](link to azure related documentation)
| - | - | [<Metric Name 2>](link to azure related documentation)

### 6.2. Alerts

> For this Service, the following Alerts will be configured to be automatically received by the DevOps Operators:

| Alert name | Condition | Alert Description  | Action
| - | - | - | -
| <alert name> | <Define per alert> | <Define per alert what the alert means when the condition is triggered> | <Suggested Action>

> Suggested alerts to be created by the ADT

| Alert name | Condition | Alert Description  | Action
| - | - | - | -
| <alert name> | <Define per alert> | <Define per alert what the alert means when the condition is triggered> | <Suggested Action>

### 6.3. Scale-out and Scale-up

<Describe how the service can be scaled, and add links to Azure related documentation>

> The following parameters will allow configuring scaling operations via Release Pipeline:

| Service Deployment parameter | Scale operation kind
| - | -
| <parameter name> | -

### 6.4. Configure Backups

<Describe Backup configuration for the Azure Service>

> The following parameters will allow to configure backups via Release Pipeline:

| Service Deployment parameter | Notes
| - | -
| <parameter name> | -

> Summary of backup options for this service

| Backup  option | Frequency | retention | type of storage | Need specific configuration by ADT
| - | - | - | - | -
| <e.g. Premium/LTR>  | <e.g. 5-10 minutes> | <e.g. 35 days> | <internal/external> | <no>

### 6.5. Restore Backups

<Describe Restore operation for the Azure Service>

> Restore Operations will be done via (Operational Tasks by the DevOps Operator | Service Request | Automated Tasks)

### 6.6. Key Rotation

<Describe Key Rotation operation for the Azure Service>

To perform this action, there is an Azure DevOps task which rotates all existing API keys. The task has the following parameters:

| Name | Description | Type | Is mandatory | Default Value | Allowed Values | Limits | Schema | Notes
| - | - | - | - | - | - | - | - | -
| {NameOfParameter} | {Description} | {string | boolean | string[] | hashtable[] | etc } | {yes | no} | `{defaultvalue}` | `{value1}`, `{value2}`, `{etc}` | {Limits} | {Schema} | {Notes}

### 6.7. High Availability

The table below describes what SLAs are provided in Azure for the Azure Services which make up this Service:

| Azure Service(s) | SLA | Conditions or limitations for guaranteeing SLA
| - | - | -
| <Azure service name> | <copy from Azure doc> <add azure link to documentation (See at [https://azure.microsoft.com/en-us/support/legal/sla/](https://azure.microsoft.com/en-us/support/legal/sla/))> | <copy from Azure doc>

<Describe how the Service can be configured with High Availability, and how it is recovered in case of an infrastructure failure.>

> The following parameters will allow to configure High Availability for the Service via Release Pipeline:

| Service Deployment parameter | Notes
| - | -
| <parameter name> | -

> High Availability can be configured via (Operational Tasks by the DevOps Operator | Service Request | Automated Tasks)

### 6.8. Disaster Recovery

<Describe how the Service can be configured across Zones (preferred) or Regions, and how it can be recovered in case of a Zone or Region infrastructure failure.>

> The following parameters will allow to configured across Zones via Release Pipeline:

| Service Deployment parameter | Notes
| - | -
| <parameter name> | -

> In case of failure, Recovery can be done via (Operational Tasks by the DevOps Operator | Service Request | Automated Tasks)
> Summary of Disaster Recovery options, either provided by certified service or managed by ADT team.

| DR option | RTO | RPO | Requires manual intervention | Implementation complexity | Additional cost impact
| - | - | - | - | - | -
| <Microsoft-initiated failover/DevOps ADT initiated> | <e.g. 2 - 26 hours> | <yes/no> |  <e.g.2 hours> | <Low/Medium/High> | <e.g. None/x2 cost of service>

### 6.9. Operational Tasks done from release pipelines

Certain Operations can be done directly from the release pipeline using Infrastructure as Code.

The operations listed below can be done by the Release Manager or by the DevOps Operator if the Release Manager grants the necessary permissions in the release pipeline. [More info](https://docs.microsoft.com/en-us/azure/devops/pipelines/policies/permissions?view=azure-devops#release-permissions).

> The following Operational Tasks will be enabled from Release Pipeline:

| Operational Task name | Parameter | Description
| - | - | -
| <operation name> | `parameterName` | <describe>

### 6.10. Operational Tasks done by Azure DevOps Operator role (ADT)

The DevOps Operator will receive permissions in the Acceptance and Production environments so that certain Operational Tasks can be done through different management tools.

> The following Operational Tasks will be enabled for the DevOps Operator:

| Operational Task name | Endpoint | Description | Tool Used | periodicity
| - | - | - | - | -
| <operation name> | <endpoint>  | <describe> | <Tool name:  link to internal doc / Microsoft doc> | <Once/Continuous/Periodic(daily-monthly)/OnDemand>

### 6.11. Update, upgrades and patching

> Azure PaaS services generally auto-updates by itself transparently, but sometimes if there are backward compatibility issues, service outage or other risks, some programatic or manual steps are needed.

## 7. Service Requests

> The following Service Requests can be asked to the Cloud Competence Center via mail to [cloudcompetencecenter@repsol.com](mailto:cloudcompetencecenter@repsol.com)

| Service Request name | Description | Notes
| - | - | -
| <request name> | <describe> | <notes>

## 8. Automated Tasks

> The following Automated Tasks related to this Service will be configured to run on a scheduled basis and will affect to this Service:

| Automated Task name | Description | Schedule| Notes
| - | - | - | -
| <task name> | <describe> | <schedule> | <notes>

## 9. Feedback

We are happy to receive any feedback you might have, about the service itself or this documentation, in order to continuously improve our certified services.

Please use [this channel](https://forms.office.com/Pages/ResponsePage.aspx?id=TyElClLuPEi5a9x58yJ6bwy-KeWIQ1xBt-SwsoQR8x9UME85WUNSNjNORDNLMDlKQlQ1NjVUVjVHWSQlQCN0PWcu) to tell us what you think.
