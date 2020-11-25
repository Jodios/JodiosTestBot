node {

    def build = "${env.BUILD_NUMBER}"
    def imageNameOld = "jodios/jodios_test_bot:${build}"
    def imageName = "jodios/jodios_test_bot:latest"
    def namespace = "prod"

    stage('Deploy to Kubernetes'){
        sh "export KUBECONFIG=~/.kube/config"
        sh 'ls'
        sh 'kubectl -n ${namespace} set image deployment/jodios-test-bot jodios-test-bot=${imageName} --record'
    }

}
