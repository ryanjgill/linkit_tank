# LinkIt 7688 Duo Tank
Using a LinkIt 7688 Duo to replace the internals of an R/C toy tank.

## Dockerfile for Cross-build 
Use the provided dockerfile to build the cross-build environment for installing
node moules for the LinkIt. Follow [this guide here](https://ryanjgill.github.io/docker_mt7688_reveal/#/).

Use the provided build environment to install these node modules:
* express
* johnny-five
* socket.io


### This will use 6 digital pins on the LinkIt 7688 Duo to control 2 dc motors. 
I'm using the L298n Dual H-bridge to control the direction of the tanks using 
the Johny-Five motor class.

## Standard Firmata
Load the modified firmata sketch to the MCU of the LinkIt 7688 Duo.