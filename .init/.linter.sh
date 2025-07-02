#!/bin/bash
cd /home/kavia/workspace/code-generation/fitproof-tracker-95857-3d941f9f/fitness_app_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

