node {
    def remote = [:]
    def jenkinsCredentials = com.cloudbees.plugins.credentials.CredentialsProvider.lookupCredentials(
        com.cloudbees.plugins.credentials.Credentials.class,
        Jenkins.instance,
        null,
        null
    );
    for (creds in jenkinsCredentials) {
        if(creds.id == "test_ssh"){
            remote.name = creds.username
            remote.host = "10.0.0.18"
            remote.user = creds.username
            remote.password = creds.password
            remote.allowAnyHosts = true
        }
    }
    // def build = "${env.BUILD_NUMBER}"
    // def imageName = "jodios/jodios_test_bot:${build}"
    // def image

    // stage('Clone repository') {
    //     /* Let's make sure we have the repository cloned to our workspace */

    //     checkout scm
    // }

    // stage('Build image') {
    //     /* This builds the actual image; synonymous to
    //      * docker build on the command line */
    //     image = docker.build("${imageName}", "--build-arg discordToken=${env.discordToken} .")
    //     // sh "echo ${env.discordToken}"
    //     // sh "docker build --build-arg discordToken=${env.discordToken} -t ${image} ."
    // }

    // stage('Push image') {
    //     // pushing the image to dockerhub
    //     docker.withRegistry('https://registry.hub.docker.com', 'docker_hub_creds') {
    //         image.push()
    //     }
    // }

    stage('Deploy to Kubernetes'){
        sh "export KUBECONFIG=~/.kube/config"
        sh "docker image prune -af"
        sshCommand remote: remote, command: "ls"
        // sh "cat ~/.kube/config"
        // https://10.0.0.18:6443/
        // sh "kubectl set image deployment/test-bot-deployment test-bot=${imageName} --record"
    }

}