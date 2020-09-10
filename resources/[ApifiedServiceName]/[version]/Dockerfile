# To enable ssh & remote debugging on app service change the base image to the one below
# FROM mcr.microsoft.com/azure-functions/powershell:3.0-appservice
FROM mcr.microsoft.com/powershell
COPY . /
RUN apt-get update && apt-get install -y git \
    #Install powershell modules and activate AzureRMAlias
    && pwsh -c "Install-Module Az -force; Import-Module Az -Global; Enable-AzureRMAlias -Scope LocalMachine;" \
    #API calls needs Newtonsoft
    && pwsh -c "Install-Module newtonsoft.json -force; Import-Module newtonsoft.json -Global;"
