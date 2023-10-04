
SHELL := /bin/bash

version: pom.xml
	bash -l -c 'nvm use $$(mvn help:evaluate -Dexpression=node.version -q -DforceStdout)' > $@
	cat $@
	

.PHONY: build explore
build:
	docker run --platform=linux/amd64 -it -v $$(pwd):/app -v ${HOME}/.m2:/root/.m2 -w /app maven:3-eclipse-temurin-17 
	
explore:
	docker run -it -v $$(pwd):/app -v ${HOME}/.m2:/root/.m2 -w /app --entrypoint /bin/bash maven:3-eclipse-temurin-17 