pipeline {
  agent any

  environment {
    IMAGE_NAME = "backend-repo:latest"
    CONTAINER_NAME = "backend-repo-container"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $IMAGE_NAME .'
      }
    }

    stage('Run Container') {
      steps {
        sh '''
          docker rm -f $CONTAINER_NAME || true
          docker run -d --name $CONTAINER_NAME -p 5000:5000 --env-file .env.docker $IMAGE_NAME
        '''
      }
    }
  }

  post {
    success {
      script {
        node(null) {
          withCredentials([string(credentialsId: 'backend-slack-webhook', variable: 'SLACK_URL')]) {
            sh '''
              curl -sS -X POST -H "Content-type: application/json" \
                --data '{"text":"Backend pipeline succeeded."}' \
                "$SLACK_URL"
            '''
          }
        }
      }
    }
    failure {
      script {
        node(null) {
          withCredentials([string(credentialsId: 'backend-slack-webhook', variable: 'SLACK_URL')]) {
            sh '''
              curl -sS -X POST -H "Content-type: application/json" \
                --data '{"text":"Backend pipeline failed."}' \
                "$SLACK_URL"
            '''
          }
        }
      }
    }
  }
}
