node {

    def build = "${env.BUILD_NUMBER}"
    def imageName = "jodios/jodios_test_bot:latest"
    def image

    stage('Clone repository') {
        /* Let's make sure we have the repository cloned to our workspace */

        checkout scm
    }

    // stage('Build image') {
    //     /* This builds the actual image; synonymous to
    //      * docker build on the command line */
    //     echo "${env.discordToken}"
    //     image = docker.build("${imageName}", "--build-arg discordToken=${env.discordToken} .")
    // }

    // stage('Push image') {
    //     // pushing the image to dockerhub
    //     withDockerRegistry(credentialsId: 'docker_hub_creds', url: 'https://registry.hub.docker.com') {
    //         image.push()
    //     }
    // }

    // stage('Deploy image'){
    //     sh "export KUBECONFIG=~/.kube/config"
    //     sshCommand remote: remote, command: "ls"
    //     sshCommand remote: remote, command: "kubectl set image deployment/test-bot-deployment test-bot=${imageName} --record"
    // }

}
