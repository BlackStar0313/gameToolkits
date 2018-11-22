pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'echo "Hello World"'
                sh '''
                    echo "Multiline shell steps works too"
                    ls -lah
                    /Users/liuzhiwei/work/h5game/maker5-letsfarm-frontend/tools/gulpPackData/jenkins.sh
                '''
            }
        }
    }
}
