// Scripted Pipeline (node + stage) — works with Pipeline (workflow) even if Declarative "post" is unavailable.
// If you install "Pipeline: Declarative", you may switch back to declarative syntax.

node {
    def IMAGE_NAME = 'backend-repo:latest'
    def CONTAINER_NAME = 'backend-repo-container'
    def NODE_VERSION = '20.18.1'

    def buildOk = false
    try {
        // Groovy `def NODE_VERSION` is not a shell variable — with `set -u`, bare `${NODE_VERSION}` in sh ''' fails.
        stage('Prepare Node toolchain') {
            withEnv(["NODE_VERSION=${NODE_VERSION}"]) {
                sh '''
                    set -eux
                    command -v curl >/dev/null 2>&1 || { echo "Install curl on the agent."; exit 1; }
                    NROOT="${WORKSPACE}/.jenkins-node"
                    NODE_HOME="${NROOT}/node-v${NODE_VERSION}-linux-x64"
                    mkdir -p "${NROOT}"
                    if [ ! -x "${NODE_HOME}/bin/node" ]; then
                        curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" \
                            -o "/tmp/node-${NODE_VERSION}.tar.gz"
                        tar -xzf "/tmp/node-${NODE_VERSION}.tar.gz" -C "${NROOT}"
                    fi
                    echo "export NODE_HOME=\"${NODE_HOME}\"" > "${WORKSPACE}/.jenkins-node-env"
                    echo "export PATH=\"${NODE_HOME}/bin:\$PATH\"" >> "${WORKSPACE}/.jenkins-node-env"
                '''
            }
        }

        stage('Install Dependencies') {
            sh '''
                set -eux
                . "${WORKSPACE}/.jenkins-node-env"
                node -v && npm -v
                npm ci
            '''
        }

        stage('Test') {
            sh '''
                set -eux
                . "${WORKSPACE}/.jenkins-node-env"
                npm test
            '''
        }

        stage('Build') {
            sh '''
                set -eux
                . "${WORKSPACE}/.jenkins-node-env"
                npm run build
            '''
        }

        stage('Docker Build & Run') {
            def rc = sh(script: 'command -v docker >/dev/null 2>&1', returnStatus: true)
            if (rc != 0) {
                echo 'SKIP: Docker not on PATH — install Docker on the agent for image build/run.'
            } else {
                sh """
                    docker build -t ${IMAGE_NAME} .
                    docker rm -f ${CONTAINER_NAME} 2>/dev/null || true
                    docker run -d --name ${CONTAINER_NAME} -p 5000:5000 --env-file .env.jenkins ${IMAGE_NAME}
                """
            }
        }

        buildOk = true
    } catch (e) {
        echo "Build failed: ${e}"
        throw e
    } finally {
        notifyBackendSlack(buildOk)
    }
}

void notifyBackendSlack(boolean ok) {
    try {
        withCredentials([string(credentialsId: 'backend-slack-webhook', variable: 'SLACK_URL')]) {
            if (ok) {
                sh '''
                    curl -sS -X POST -H "Content-type: application/json" \
                      --data '{"text":"Backend pipeline succeeded."}' \
                      "$SLACK_URL"
                '''
            } else {
                sh '''
                    curl -sS -X POST -H "Content-type: application/json" \
                      --data '{"text":"Backend pipeline failed."}' \
                      "$SLACK_URL"
                '''
            }
        }
    } catch (ignored) {
        echo 'Slack skipped (add credential backend-slack-webhook as Secret text, or ignore).'
    }
}
