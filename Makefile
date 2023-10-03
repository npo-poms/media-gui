
SHELL := /bin/bash

version: pom.xml
	bash -l -c 'nvm use $$(mvn help:evaluate -Dexpression=node.version -q -DforceStdout)' > $@
	cat $@
	