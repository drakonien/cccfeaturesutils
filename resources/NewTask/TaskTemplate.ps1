<#
.SYNOPSIS
	This Script will process the parameters for the Operation '[Operation]' of the Certified Service '[ServiceName]'

.DESCRIPTION
	In first place, the parameters will be merged in a PowerShell Custom Object,
   similar to the Object resulting from the cmdlet 'CovertTo-Json'. After that,
   the ARM Templates and Scripts that will accomplish the Operation will be called
   and executed with the parameters needed from this parameters list.

   Two sets of parameters will be offered to call this script:
       +   One set of parameters with only the resource group name and a path to a
           parameters file (ARM syntax). In this case, all the parameters will be passed
           from a file.
       +   Another set of parameters with a mandatory Resource Group name and one parameter
           per parameter needed. In this case, instead of storing the parameters in a file,
           the parameters will be passed directly as PowerShell parameters of type String
           with JSON notation for complex objects (arrays, lists). During the deployment of
           an ARM Template, every parameter will be parsed accordingly.

.PARAMETER PathToParameters
   The path to the file that containes the values for the parameters needed in the operation,
   in ARM template syntaxis.

.PARAMETER ResourceGroupName
   The name of the resource group in which the Operation will be executed.

.PARAMETER Parameter1
   Description for parameter 1.

.PARAMETER ParameterN
   Description for parameter N.
#>

#region PARAMETERS
# http://blog.simonw.se/powershell-functions-and-parameter-sets/
[cmdletbinding(DefaultParameterSetName = 'ScriptParameter')]
Param(
    [Parameter(ParameterSetName = 'ParametersFile', Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string] $PathToParameters,

    [Parameter(ParameterSetName = 'ParametersFile', Mandatory = $false)]
    [Parameter(ParameterSetName = 'ScriptParameter', Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string] $ResourceGroupName,

    [Parameter(ParameterSetName = 'ParametersFile', Mandatory = $false)]
    [Parameter(ParameterSetName = 'ScriptParameter', Mandatory = $true)]
    [ValidateSet("AllowedValue1", "AllowedValue1")]
    [ValidateNotNullOrEmpty()]
    #[AllowNull()]
    #See more options at: http://blog.simonw.se/powershell-functions-and-parameter-sets/
    [string] $Parameter1,

    [Parameter(ParameterSetName = 'ParametersFile', Mandatory = $false)]
    [Parameter(ParameterSetName = 'ScriptParameter', Mandatory = $false)]
    [string] $ParameterN = "[DefaultValue]"
)
#endregion

#region INITIALIZE VARIABLES & PREFERENCES
$global:VerbosePreference = "Continue"
$global:ErrorActionPreference = "Stop"
#endregion

#region FUNCTIONS
function _importModulesFromPackagesConfig {
    $serviceRootDirectory = Join-Path $PSScriptRoot "../" -Resolve
    $packagesDirectory = Join-Path $serviceRootDirectory "/.packages/" -Resolve
    $scriptsDirectory = Join-Path $PSScriptRoot "./" -Resolve
    Write-Verbose "##[$($MyInvocation.MyCommand)] Service Root Directory   : [$serviceRootDirectory]"
    Write-Verbose "##[$($MyInvocation.MyCommand)] Packages Directory       : [$packagesDirectory]"
    Write-Verbose "##[$($MyInvocation.MyCommand)] Scripts Directory        : [$scriptsDirectory]"

    $modules = @()

    #Include custom module
    $customModules = (Get-ChildItem -Path $scriptsDirectory | Where-Object Name -like "*.psd1").Name
    foreach ($customModuleDescriptionFileName in $customModules) {
        $modules += @{
            EntryPoint = $customModuleDescriptionFileName
        }
    }

    #Include dependencies
    $packagesConfigPath = Join-Path $serviceRootDirectory "packages.config"
    if (-not (Test-Path $packagesConfigPath)) {
        Throw "##[$($MyInvocation.MyCommand)] The file 'packages.config' must be defined in the directory '$serviceRootDirectory'"
    }
    $packagesConfig = [xml](Get-Content -Path $packagesConfigPath)
    foreach ($module in $packagesConfig.packages.package) {
        if ($module.id -notlike "ApiWrapper*") {
            if ($module.id -eq "Common") {
                $moduleScriptsPath = Join-Path $packagesDirectory ($module.id + "." + $module.version)
            }
            else {
                $moduleScriptsPath = Join-Path (Join-Path $packagesDirectory ($module.id + "." + $module.version)) "Scripts"
            }
            $modules += @{
                Name       = $module.id
                EntryPoint = (Get-ChildItem $moduleScriptsPath | Where-Object Name -like "*.psd1").Name
            }
        }
    }
    Write-Verbose "##[$($MyInvocation.MyCommand)] Import the following modules:"
    Write-Verbose ($modules | ConvertTo-Json -Depth 10)

    _importCccModules -moduleListDefinition $modules -scriptsDirectory $scriptsDirectory -packagesFilePath $packagesConfigPath -Verbose:$VerbosePreference | Out-Null
}

function _importCccModules {
    [CmdletBinding(DefaultParameterSetName = 'SingleModule')]
    Param (
        [parameter(Mandatory = $true, Position = 1, HelpMessage = 'List of module definitions (definition is an object with Name and EntryPoint properties)')]
        [ValidateNotNullOrEmpty()]
        [object] $moduleListDefinition,
        [parameter(Mandatory = $true)]
        [string] $scriptsDirectory,
        [parameter(Mandatory = $true)]
        [string] $packagesFilePath
    )
    # Imports all modules (nuget or powershell scripts) based on the list of definitions
    foreach ($module in $moduleListDefinition) {
        try {
            # Check if this is a module or a powershell library
            Write-Verbose "##[$($MyInvocation.MyCommand)] Importing module '$($module.EntryPoint)'"
            if ( !$module.containsKey('Name') -or [string]::IsNullOrWhiteSpace($module.Name) ) {
                #powershell library to load
                $fullModulePath = Join-Path $scriptsDirectory $module.EntryPoint -Resolve -Verbose:$false #Resolve-Path -Path $module.EntryPoint
            }
            else {
                # CCC module (nuget)
                $nugetPath = _getNugetLibraryPath -nugetName $module.Name -packagesFilePath $packagesFilePath -Verbose:$true
                if ([string]::IsNullOrWhiteSpace($module.EntryPoint)) {
                    $module.EntryPoint = $module.Name + ".psd1"
                }
                $fullModulePath = Join-Path $nugetPath $module.EntryPoint -Resolve -ErrorAction:SilentlyContinue -Verbose:$false
                if ($null -eq $fullModulePath) {
                    $fullModulePath = Join-Path -Path "$nugetPath/Scripts" -ChildPath $module.EntryPoint -Resolve -Verbose:$false
                }
            }
            Import-Module $fullModulePath -Force -Verbose:$false <#-Global#> | Out-Null
        }
        catch {
            Write-Verbose "##[$($MyInvocation.MyCommand)] ERROR: $($_.InvocationInfo | convertto-json -depth 1)"
        }
    }
}

function _getNugetLibraryPath {

    #region PARAMETERS
    Param (
        [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()]
        [String] $nugetName,
        [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()]
        [String] $packagesFilePath
    )
    #endregion

    $path = $null

    if ([String]::IsNullOrWhiteSpace($packagesFilePath)) {
        $packagesFilePath = $global:serviceRootDirectory
    }
    Write-Verbose "##[$($MyInvocation.MyCommand)] packagesFilePath: [$packagesFilePath]"

    if (Test-Path -Path $packagesFilePath) {
        $packageData = select-xml -Path $packagesFilePath -XPath "//package[@id='$nugetName']"
        if ($null -ne $packageData) {
            $nugetFullName = [String]::Format("{0}.{1}/", $nugetName, $packageData.Node.version)
            $path = Join-Path $packagesDirectory $nugetFullName
        }
    }
    else {
        Write-Warning "##[$($MyInvocation.MyCommand)] WRN: Unable to find [$packagesDefinitionFilePath]"
    }
    Write-Verbose "##[$($MyInvocation.MyCommand)] Path for [$nugetName] package: [$path]"
    return $path
}

#endregion

#region INITIALIZE CONTEXT VARIABLES & PREFERENCES
Write-Verbose "##[$($MyInvocation.MyCommand)] Initializing Context Variables and Preferences"
$ErrorActionPreference = "Stop"

#endregion

#region Import modules
Write-Verbose "##[$($MyInvocation.MyCommand)] Importing modules"
_importModulesFromPackagesConfig

#endregion

#region Writes in Verbose all parameter values
Write-ScriptParametersVerbose $PSCmdlet.MyInvocation
#endregion

#region Load invoked parameters
Write-Verbose "##[$($MyInvocation.MyCommand)] Loading parameters"
$hashParameters = Get-ParametersHashTable -FunctionName '[Operation]-Ccc[ServiceName]Deployment' -CmdletInvocation $PSCmdlet.MyInvocation
#endregion

#For extensions or local context, connections to Azure and Azure AD must already exist

#TODO:DEFINE PER SERVICE IF ADDITIONAL CONNECTIONS THAT NEED TO BE DONE

#endregion

#region Calculated parameters
Write-Verbose "##[$($MyInvocation.MyCommand)] Initializing calculated parameters"

#TODO: OBTAIN OTHER VARIABLES WHEN NEEDED.
#$vstsUserName = (Get-CccAzureKeyVaultItem -ResourceId $CccPlatformKeyVaultResourceId -Name $DisconnectedEnvironmentPATKeyVaultSecretName -ItemType 'Secret').ContentType
#TODO: ADD VARIABLES TO THE PARAMETERS SET FOR SERVICE DEPLOYMENT WHEN NEEDED
#Add-Parameter -Table $jsonParameters -ParameterName 'ProjectCurrentUser' -ParameterValue $vstsUserName -OverwriteIfExists:$true

#E.G.: ADD PARAMETERS AS KEY VAULT SECRETS REFERENCE FOR SERVICE DEPLOYMENT
#$environment = (Get-AzureRmResourceGroup -Name $ResourceGroupName).Tags.Environment
#$platformKeyVaultResourceId = Get-CccManagementKeyVaultResourceId -EnvironmentName $environment
#Add-Parameter -Table $jsonParameters -ParameterName "ApplicationGatewaySSLCertificateKeyVaultResourceId" -ParameterValue $platformKeyVaultResourceId -OverwriteIfExists
#Add-Parameter -Table $jsonParameters -ParameterName "ApplicationGatewaySSLCertificateKeyVaultSecret" -ParameterValue "InternalWildcardRepsolComFile" -OverwriteIfExists
#Add-Parameter -Table $jsonParameters -ParameterName "ApplicationGatewaySSLCertificatePasswordKeyVaultSecret" -ParameterValue "InternalWildcardRepsolComPwd" -OverwriteIfExists
#endregion

#region INITIALIZE Insight context
Write-Verbose "##[$($MyInvocation.MyCommand)] Initializing Insights context"
$environmentName = Get-CccEnvironmentName -ResourceGroupName $hashParameters.ResourceGroupName
Start-CccTelemetryOperation -EnvironmentName $environmentName -Verbose:$VerbosePreference
#endregion

try {
    Write-CccVerbose "The Service will be [Operation] with the following parameters:"
    Write-CccVerbose ($hashParameters | ConvertTo-Json -Depth 10)
    Write-CccVerbose "Validating parameters"
    Test-Ccc[ServiceName][Operation]Parameters @hashParameters
    Write-CccVerbose "Starting Main Code"
    $output = [Operation]-Ccc[ServiceName]Deployment @hashParameters
}
catch {
    Write-Cccverbose "ERROR: $($_.InvocationInfo | convertto-json -depth 1)"
    Write-CccException $_
}
finally {
    Write-CccVerbose "Stopping Insights operation"
    Stop-CccTelemetryOperation -Verbose:$VerbosePreference
}

Write-Verbose "##[$($MyInvocation.MyCommand)] End of Script"

return $output
