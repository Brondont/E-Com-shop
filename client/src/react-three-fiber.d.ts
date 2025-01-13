import React from "react";
import { Object3D } from "three";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      primitive: {
        object: Object3D;
        [key: string]: any; // Allow other custom properties
      };
    }
  }
}
