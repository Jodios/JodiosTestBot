node {

    def build = "${env.BUILD_NUMBER}"
    def imageName = "jodios/jodios_test_bot:latest"
    def image

    // stage('Clone repository') {
    //     /* Let's make sure we have the repository cloned to our workspace */

    //     checkout scm
    // }

    // stage('Deploy image'){
    //     sh "export KUBECONFIG=~/.kube/config"
    //     sshCommand remote: remote, command: "ls"
    //     sshCommand remote: remote, command: "kubectl set image deployment/test-bot-deployment test-bot=${imageName} --record"
    // }

    stage('Kubernetes'){
        sh 'ls -a ~'
        sh "export KUBECONFIG=~/.kube/config"
        // sshCommand remote: remote, command: "ls"
        // sshCommand remote: remote, command: "kubectl set image deployment/test-bot-deployment test-bot=${imageName} --record"
    }

}
