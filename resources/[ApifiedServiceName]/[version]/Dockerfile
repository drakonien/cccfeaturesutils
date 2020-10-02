# To enable ssh & remote debugging on app service change the base image to the one below
# FROM mcr.microsoft.com/azure-functions/powershell:3.0-appservice
FROM mcr.microsoft.com/powershell
ARG AZ_VERSION

COPY . /

RUN apt-get update
RUN apt-get install -y git

#Install powershell modules and activate AzureRMAlias
RUN if [ "x$AZ_VERSION" = "x" ] ; then \
    pwsh -c "Install-Module Az -force; Import-Module Az -Global; Enable-AzureRMAlias -Scope LocalMachine;"; \
else \
    pwsh -c "Install-Module Az -force -RequiredVersion ${AZ_VERSION}; Import-Module Az -Global; Enable-AzureRMAlias -Scope LocalMachine;"; \
fi

#API calls needs Newtonsoft
RUN pwsh -c "Install-Module newtonsoft.json -force; Import-Module newtonsoft.json -Global;"