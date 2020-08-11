<#
.SYNOPSIS
    This Library contains specific functions for the Certified Service '[ServiceName]'

.DESCRIPTION
    Create here all funcions required for the Certified Service '[ServiceName]' in order
    to individually test each of them without running the whole operation.

#>

# Add regions to manage related functions defined in this module
#region '[ServiceName]' specific funcions
#end region

#region Test Parameters
function Test-Ccc[ServiceName]DeployParameters {
    Param(
        [ValidateNotNullOrEmpty()]
        [string] $ResourceGroupName,

        [Parameter(ParameterSetName = 'ScriptParameter', Mandatory = $false)]
        [ValidateNotNullOrEmpty()]
        [string] $[ServiceName]Name
    )

    #region Initialize Parameters
    Write-CccVerbose "Initializing Parameters"

    #endregion

    #region Initialize Variables
    Write-CccVerbose "Initializing Variables"
    #endregion

    #region Main Logic
    Write-CccVerbose "Starting Main Logic"
    ###############################################################################################
    #TODO: Perform all the necessary validations on the parameters array, its elements and values #
    ###############################################################################################

    <#EXAMPLE FROM KEY VAULT
    if (($JsonParameters.PsObject.Properties | Where-Object {$_.Name -eq 'accessPolicies'})) {
        #try to convert the specified value from JSON
        try{
            $JsonParameters.accesspolicies.value = $JsonParameters.accesspolicies.value | ConvertFrom-Json
        } catch{}
        #For each Access Policy declared in the ARM Template, find the corresponding GUID value for Object ID
        foreach ($JsonParameters in $JsonParameters.accesspolicies.value) {
            $Identity = $Item.objectId
            $Item.objectId = ChangeObjectID -Identity $Identity -Verbose:$VerbosePreference
        }
    }
    #>

    #endregion
}

function Test-Ccc[ServiceName]RemoveParameters {
    Param(
        [ValidateNotNullOrEmpty()]
        [string] $ResourceGroupName,

        [Parameter(ParameterSetName = 'ScriptParameter', Mandatory = $false)]
        [ValidateNotNullOrEmpty()]
        [string] $[ServiceName]Name
    )

    #region Initialize Parameters
    Write-CccVerbose "Initializing Parameters"

    #endregion

    #region Initialize Variables
    Write-CccVerbose "Initializing Variables"
    #endregion

    #region Main Logic
    Write-CccVerbose "Starting Main Logic"
    ###############################################################################################
    #TODO: Perform all the necessary validations on the parameters array, its elements and values #
    ###############################################################################################

    <#EXAMPLE FROM KEY VAULT
    if (($JsonParameters.PsObject.Properties | Where-Object {$_.Name -eq 'accessPolicies'})) {
        #try to convert the specified value from JSON
        try{
            $JsonParameters.accesspolicies.value = $JsonParameters.accesspolicies.value | ConvertFrom-Json
        } catch{}
        #For each Access Policy declared in the ARM Template, find the corresponding GUID value for Object ID
        foreach ($JsonParameters in $JsonParameters.accesspolicies.value) {
            $Identity = $Item.objectId
            $Item.objectId = ChangeObjectID -Identity $Identity -Verbose:$VerbosePreference
        }
    }
    #>

    #endregion
}
#endregion

#region DEPLOYMENT
function Deploy-Ccc[ServiceName]Deployment {
    Param(
        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string] $ResourceGroupName,

        [Parameter(Mandatory = $false)]
        [ValidateNotNullOrEmpty()]
        [string] $[ServiceName]Name
    )

    #region Initialize Variables
    Write-CccVerbose "Initializing Variables"
    $armTemplateFilename = "[ServiceName].json"
    #endregion

    #region Main Logic
    Write-CccVerbose "Starting Main Logic"

    #region Deploy ARM Template
    Write-CccVerbose "Deploy ARM Template '$armTemplateFilename'"
    $ApplicationGatewaySSLCertificateBase64Info = @{
        KeyVaultResourceId = $sslCertificateKeyVaultResourceId
        SecretName         = $sslCertificateKeyVaultSecretName
    }
    $fullArmTemplatePath = Get-TemplatePath -ArmTemplateFilename $armTemplateFilename -ScriptRoot $PSScriptRoot
    $deployment = New-ARMTemplateDeployment -ARMTemplatePath $fullArmTemplatePath `
        -ResourceGroupName $ResourceGroupName `
        -CmdletInvocation $PSCmdlet.MyInvocation `
        -ExtraParameters @{
        ApplicationGatewaySSLCertificateBase64  = $ApplicationGatewaySSLCertificateBase64Info
        WindowsAppServiceAppInsightsLocation    = $WindowsAppServiceAppInsightsLocation
        WindowsAppServiceStorageAccountLogsName = $windowsAppServiceStorageAccountSecurityLogsName
    } `
        -Verbose:$VerbosePreference `
        -ErrorAction Stop
    #endregion

    #region Post Deployment Scripts
    ###################################################################
    ##TODO: Post Deployment Scripts (use funtions within this module)##
    ###################################################################
    #endregion

    #region Write CCC Secrets

    #endregion

    #region Write CCC Outputs
    $outputs = @{ }
    $ServiceType = "WebSite" #Must be one of the allowed in the 'New-OutputVariableSecretName' function
    $outputs = Invoke-CCCApifOutputVariable -Outputs $outputs -OutputName $ParameterOutputVariableCustomName `
        -OutputValue $deployment.Outputs.outputname.value -KeyVaultName $ParameterOutputKeyVaultName `
        -ServiceName $[ServiceName]Name -ServiceType $ServiceType -AzDevOpsOutputSuffixName "determineDefaultVariableAffix"
    #Parameter "VariableName": This parameter allows the user to customaize the name of the output variable. If null, the default name will be used
    #Parameter "KeyVaultName": This parameter can be null. If not null, the output will be stored as a Key Vault secret
    #endregion

    $resourceNamesToTag = @($[ServiceName]Name)
    Set-ResourcesTags -ResourcesToTag $resourceNamesToTag -ResourceGroupName $ResourceGroupName
    #endregion

    return $outputs
}
#endregion

#region DEPROVISION
function Remove-Ccc[ServiceName]Deployment {
    Param(
        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string] $ResourceGroupName,

        [Parameter(Mandatory = $false)]
        [ValidateNotNullOrEmpty()]
        [string] $[ServiceName]Name
    )

    #region Initialize Variables
    Write-CccVerbose "Initializing Variables"
    #endregion

    #region Main Logic
    Write-CccVerbose "Starting Main Logic"
    #endregion
}
#endregion

Set-Alias -Name New-[ServiceName]DeploymentFromParameters -Value Deploy-Ccc[ServiceName]Deployment
Set-Alias -Name Remove-[ServiceName]FromParameters -Value Remove-Ccc[ServiceName]Deployment
Export-ModuleMember Test-Ccc[ServiceName]DeployParameters, Deploy-Ccc[ServiceName]Deployment, Test-Ccc[ServiceName]RemoveParameters, Remove-Ccc[ServiceName]Deployment `
    -Alias New-[ServiceName]DeploymentFromParameters, Remove-Ccc[ServiceName]Deployment