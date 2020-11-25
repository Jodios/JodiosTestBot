node {

    def build = "${env.BUILD_NUMBER}"
    def imageName = "jodios/jodios_test_bot:${build}"
    def namespace = "prod"
    def image

    stage('Clone repository') {
        /* Let's make sure we have the repository cloned to our workspace */

        checkout scm
    }

    stage('Build image') {
        /* This builds the actual image; synonymous to
         * docker build on the command line */
        image = docker.build("${imageName}", "--build-arg discordToken=${env.discordToken} .")
    }

    stage('Push image') {
        // pushing the image to dockerhub
        docker.withRegistry('https://registry.hub.docker.com', 'docker_hub_creds') {
            image.push()
        }
    }

    stage('Deploy to Kubernetes'){
        sh "export KUBECONFIG=~/.kube/config"
        sh 'ls'
        sh "kubectl -n ${namespace} set image deployment/jodios-test-bot jodios-test-bot=${imageName} --record"
        // sh "docker image prune -af"
    }

}
