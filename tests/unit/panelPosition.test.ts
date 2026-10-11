import test from "node:test";
import assert from "node:assert/strict";
import { panelPosition } from "../../packages/widget/src/components/panelPosition.ts";
test("guide opens beside the pointer when the right side has room",()=>{assert.deepEqual(panelPosition(300,200,350,450,1440,900),{left:318,top:160});});
test("guide flips left at the right edge",()=>{assert.equal(panelPosition(1300,200,350,450,1440,900).left,932);});
test("guide stays above bottom controls and below the viewport top",()=>{assert.equal(panelPosition(500,880,350,450,1440,900).top,360);assert.equal(panelPosition(500,0,350,450,1440,900).top,16);});
test("guide clamps inside a narrow desktop viewport",()=>{const p=panelPosition(500,300,350,450,650,700);assert.equal(p.left,132);assert.ok(p.left>=16&&p.left+350<=634);});
