pipeline {
  agent any

  environment {
    IMAGE_NAME = "backend-repo:latest"
    CONTAINER_NAME = "backend-repo-container"
    SLACK_WEBHOOK_URL = credentials('backend-slack-webhook')
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
          docker run -d --name $CONTAINER_NAME -p 5000:5000 --env-file .env $IMAGE_NAME
        '''
      }
    }
  }

  post {
    success {
      sh '''
        curl -X POST -H "Content-type: application/json" \
        --data '{"text":"Backend pipeline succeeded."}' \
        $SLACK_WEBHOOK_URL
      '''
    }
    failure {
      sh '''
        curl -X POST -H "Content-type: application/json" \
        --data '{"text":"Backend pipeline failed."}' \
        $SLACK_WEBHOOK_URL
      '''
    }
  }
}
