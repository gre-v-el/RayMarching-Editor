# RayMarching Editor

The program is meant to be a 3D modeling software for creating scenes with [ray marching](https://www.youtube.com/watch?v=Cp5WWtMoeKg). The motivation came from the lack of dedicated easy-to-use real-time software of this intent.


Current state of the project can be seen [here](https://gre-v-el.github.io/RayMarching-Editor/) 

---

<br/>
<br/>

## Current features
* ray marching a predefined scene
* phong rendering
* movement
   |  Key  |            Action             |
   | :---: | :---------------------------: |
   |  RMB  | Enable movement + look around |
   | WSAD  |    classical fly controls     |
   |  EQ   |         move up/down          |

---

<br/>
<br/>


## Timeline
  * 11-12-2021 - project start
  * 26-12-2021 - phong shading

---

<br/>
<br/>



## todo
  * shift and ctrl to modify movement speed
  * make UI with react, let user create tree structure
  * glsl code generator (from user-defined scene structure) with recursive calls
  	* primitives
  	* min
  	* max
  	* smooth-min
  	* difference
    * mirror
  	* interpolator
  	* average
  	* fractals
  	* user-defined objects
  * figure out a way for the processor to know the distance to the scene
  * UI
    * parent-child tree
    * object inspector and manipulation
  * hdri
  * save/load system
  * rendering 
    * support for different materials
    * support for many lights
    * tri-planar mapping textures
    * "post processing effects" 
      * ambient occlusion
      * glow
    * anti-aliasing
  * electron.js desktop version
  * export to polygonal model files using marching cubes
