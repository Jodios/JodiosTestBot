node {

    def build = "${env.BUILD_NUMBER}"
    def imageName = "jodios/jodios_test_bot:${build}"
    def image

    stage('Clone repository') {
        /* Let's make sure we have the repository cloned to our workspace */

        checkout scm
    }

    stage('Build image') {
        /* This builds the actual image; synonymous to
         * docker build on the command line */
        image = docker.build("${imageName}", "--build-arg discordToken=${env.discordToken}")
        // sh "echo ${env.discordToken}"
        // sh "docker build --build-arg discordToken=${env.discordToken} -t ${image} ."
    }

    stage('Push image') {
        // pushing the image to dockerhub
        docker.withRegistry('https://registry.example.com', 'docker_hub_creds') {
            image.push()
        }
    }

}