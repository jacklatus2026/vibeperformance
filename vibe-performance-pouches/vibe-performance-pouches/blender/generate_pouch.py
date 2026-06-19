"""
generate_pouch.py — models the matte-black VIBE tin in Blender and exports GLB.

The web app renders a procedural tin by default (no asset needed), so this is an
OPTIONAL higher-fidelity path. Run headless:

    blender --background --python blender/generate_pouch.py
    # writes models/pouch.glb

It builds the puck by spinning the rounded silhouette, then names three parts so
a loader could re-texture them per SKU:

    Vibe_Body  -> matte-black puck
    Vibe_Ring  -> emissive LED ring at the lower seam (recoloured per SKU)
    Vibe_Lid   -> flat top (white VIBE / SKU artwork)

Proportions mirror src/pouch.js (R, HH, CR, SEAM_Y) — keep them in sync.
"""

import math
import os
import bpy
import bmesh
from mathutils import Vector

R = 1.0       # radius
HH = 0.42     # half height
CR = 0.06     # edge corner radius
SEAM_Y = -0.16
SEG = 96      # radial segments
ARC = 8       # segments per rounded corner

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "models", "pouch.glb"))


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def body_profile():
    """Closed silhouette: bottom centre -> edges -> top centre."""
    pts = [Vector((0.0, -HH)), Vector((R - CR, -HH))]
    cx = R - CR
    cy = -HH + CR
    for i in range(ARC + 1):
        a = -math.pi / 2 + (math.pi / 2) * (i / ARC)
        pts.append(Vector((cx + math.cos(a) * CR, cy + math.sin(a) * CR)))
    cy = HH - CR
    for i in range(ARC + 1):
        a = (math.pi / 2) * (i / ARC)
        pts.append(Vector((cx + math.cos(a) * CR, cy + math.sin(a) * CR)))
    pts.append(Vector((0.0, HH)))
    return pts


def revolve(profile, name):
    bm = bmesh.new()
    rings = []
    for k in range(SEG):
        ang = (2 * math.pi) * (k / SEG)
        c, s = math.cos(ang), math.sin(ang)
        rings.append([bm.verts.new((p.x * c, p.x * s, p.y)) for p in profile])
    bm.verts.ensure_lookup_table()
    n = len(profile)
    for k in range(SEG):
        a = rings[k]
        b = rings[(k + 1) % SEG]
        for j in range(n - 1):
            bm.faces.new((a[j], a[j + 1], b[j + 1], b[j]))
    bm.normal_update()
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def mat(name, base, metallic, rough, emit=None, emit_strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*base, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = rough
    if emit is not None:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (*emit, 1.0)
            bsdf.inputs["Emission Strength"].default_value = emit_strength
    return m


def build():
    # matte-black body
    body = revolve(body_profile(), "Vibe_Body")
    body.data.materials.append(mat("Vibe_Body", (0.045, 0.045, 0.05), 0.0, 0.62))

    # emissive ring torus at the seam (default red = PRO)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=R, minor_radius=0.02, location=(0, 0, SEAM_Y),
        major_segments=120, minor_segments=16,
    )
    ring = bpy.context.active_object
    ring.name = "Vibe_Ring"
    ring.data.materials.append(
        mat("Vibe_Ring", (0, 0, 0), 0.0, 0.4, emit=(1.0, 0.18, 0.23), emit_strength=6.0)
    )

    # flat lid disc (artwork applied in-app)
    bpy.ops.mesh.primitive_circle_add(radius=R - CR, fill_type="NGON", location=(0, 0, HH + 0.002))
    lid = bpy.context.active_object
    lid.name = "Vibe_Lid"
    lid.data.materials.append(mat("Vibe_Lid", (0.045, 0.045, 0.05), 0.0, 0.55))


def export():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True, export_yup=True)
    print(f"[VIBE] Exported {OUT}")


def main():
    reset_scene()
    build()
    export()


if __name__ == "__main__":
    main()
