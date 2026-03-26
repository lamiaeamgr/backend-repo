post {
  success {
    withCredentials([string(credentialsId: 'backend-slack-webhook', variable: 'SLACK_URL')]) {
      sh '''
        curl -sS -X POST -H "Content-type: application/json" \
          --data '{"text":"Backend pipeline succeeded."}' \
          "$SLACK_URL"
      '''
    }
  }
  failure {
    withCredentials([string(credentialsId: 'backend-slack-webhook', variable: 'SLACK_URL')]) {
      sh '''
        curl -sS -X POST -H "Content-type: application/json" \
          --data '{"text":"Backend pipeline failed."}' \
          "$SLACK_URL"
      '''
    }
  }
}