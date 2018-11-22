pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'echo "Hello World"'
                sh '''
                    echo "Multiline shell steps works too"
                    pwd
                    cd ../
                    pwd
                    cd /Users/liuzhiwei/work/h5game/maker5-letsfarm-frontend
                    pwd
                    gulp dist --ENV wechat --NOMESSUP  --VERSION 2018-11-20_4f4be70d  --PUBLISH_VERSION 0.0.64 --UPLOAD
                '''
            }
        }
    }
}
