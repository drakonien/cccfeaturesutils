Set-StrictMode -Version Latest

# Remove any loaded version of this module so only the files
# imported below are being tested.
Get-Module CCC.[ServiceName].Common | Remove-Module -Force
Get-Module CertifiedServices-Common | Remove-Module -Force

# Load the modules we want to test and any dependencies
Import-Module $PSScriptRoot\..\CCC.[ServiceName].Common.psd1 -Force 
Import-Module $PSScriptRoot\..\..\..\..\..\Common\2.0\CertifiedServices-Common.psd1 -Force

InModuleScope 'CCC.[ServiceName].Common' {

    Describe "Functions" {
        #global mocks
        Mock Write-Error { } -ModuleName CCC.[ServiceName].Common
        Mock Write-Warning { } -ModuleName CCC.[ServiceName].Common
        Mock Write-Verbose { } -ModuleName CCC.[ServiceName].Common

        Mock Write-CccError { } -ModuleName CCC.[ServiceName].Common
        Mock Write-CccWarning { } -ModuleName CCC.[ServiceName].Common
        Mock Write-CccVerbose { } -ModuleName CCC.[ServiceName].Common

        Context "Deploy" {

            It "Validate 'Test-CCC[ServiceName]DeployParameters' function" {
                #arrange
                $parameters = @{
                        ResourceGroupName = "resourceName"
                        [ServiceName]Name = "serviceName"
                    }
            
                #act
                $result = Test-CCC[ServiceName]DeployParameters @parameters

                #assert
                $result | Should -Be $null
            }

            It "Validate 'Deploy-CCC[ServiceName]Deployment' function" {
                #arrange
                $parameters = @{
                    ResourceGroupName = "resourceName"
                    [ServiceName]Name = "serviceName"
                }
            
                #define mocks
                Mock Get-TemplatePath {
                    return "path"
                } -ModuleName CCC.[ServiceName].Common

                Mock New-ARMTemplateDeployment {
                    return $null
                } -ModuleName CCC.[ServiceName].Common

                Mock Set-ResourcesTags {
                    return $null
                } -ModuleName CCC.[ServiceName].Common

                Mock Invoke-CCCApifOutputVariable  {
                    return @{
                        Key = "Value"
                    }
                } -ModuleName CCC.[ServiceName].Common

                #act
                $ret = Deploy-CCC[ServiceName]Deployment @parameters

                #assert
                $ret | Should Not Be $null
                Assert-MockCalled Get-TemplatePath -Exactly 1 -ModuleName CCC.[ServiceName].Common -Scope It
                Assert-MockCalled New-ARMTemplateDeployment -Exactly 1 -ModuleName CCC.[ServiceName].Common -Scope It
                Assert-MockCalled Set-ResourcesTags -Exactly 1 -ModuleName CCC.[ServiceName].Common -Scope It
                Assert-MockCalled Invoke-CCCApifOutputVariable  -Exactly 1 -ModuleName CCC.[ServiceName].Common -Scope It
            }
        }

        Context "Remove" {

            It "Validate 'Test-CCC[ServiceName]RemoveParameters' function" {
                #arrange
                $parameters = @{
                    ResourceGroupName = "resourceName"
                    [ServiceName]Name = "serviceName"
                }

                #act
                $result = Test-CCC[ServiceName]RemoveParameters @parameters

                #assert
                $result | Should -Be $null
            }

            It "Validate 'Remove-CCC[ServiceName]Deployment' function" {
                #arrange
                $parameters = @{
                    ResourceGroupName = "resourceName"
                    [ServiceName]Name = "serviceName"
                }

                #define mocks
                
                #act
                $ret = Remove-CCC[ServiceName]Deployment @parameters

                #assert
                $ret | Should be $null
            }
        }
    }
}
