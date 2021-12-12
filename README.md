# RayMarching Editor

The program is meant to be a 3D modeling software for creating scenes with [ray marching](https://www.youtube.com/watch?v=Cp5WWtMoeKg). The motivation came from the lack of dedicated easy-to-use real-time software of this intent.


Current state of the project can be seen [here](https://gre-v-el.github.io/RayMarching-Editor/) 

---

<br/>
<br/>

## Current features
* rendering of a predefined scene
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
  * project start: 11-12-2021

---

<br/>
<br/>



## todo
  * convert javascript to typescript
  * choose UI library
  * movement
    * shift and ctrl to modify movement speed
  * GPU-side data structure for storing objects
  	* primitives
  	* min-wrapper
  	* max-wrapper
  	* smooth-min-wrapper
  	* smooth-max-wrapper
        * mirror
  	* interpolator
  * UI
    * parent-child tree representing the GPU-side data structure
    * object inspector and manipulation
    * custom user-defined objects
  * background gradient editor / hdri
  * save/load system
  * rendering 
    * lighting
    * materials
      * PBR
      * tri-planar mapping textures
    * view presets
      * performant preview
      * toon shading
      * moody
      * production quality
  * electron.js desktop version
  * export to polygonal model files using marching cubes
