function degree2Pi(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

class chainBrakeSimulator {
    chainDimensions = {
        linkLength: 100,
        linkWidth: 20,
        linkThickness: 5,
        chainRivetLength: 100,
        chainRivetDia: 4,
        board:{
            length: 1500,
            width:  300,
            thickness: 50
        }
    }
    materials = {}
    initialCamRadius = 2000
    intervals = {}
    constructor() {
    }


    createMaterials() {
        let scene = this.scene
        let aluminiumMaterial = new BABYLON.StandardMaterial("", scene);
        aluminiumMaterial.diffuseTexture = new BABYLON.Texture(
            "/textures/aluminiumTexture.jpeg",
            scene
        );
        this.materials.aluminiumMaterial = aluminiumMaterial

        let woodMaterial = new BABYLON.StandardMaterial("", scene);
        woodMaterial.diffuseTexture = new BABYLON.Texture(
            "/textures/wood1.jpeg",
            scene
        );
        this.materials.woodMaterial = woodMaterial

        let wood1Material = new BABYLON.StandardMaterial("", scene);
        wood1Material.diffuseTexture = new BABYLON.Texture(
            "/textures/wood.jpg",
            // "/textures/fur.jpg",
            scene
        );
        wood1Material.uScale = 1000;
        wood1Material.vScale = 10;
        this.materials.wood1Material = wood1Material


        let ropeMaterial = new BABYLON.StandardMaterial("", scene);
        ropeMaterial.diffuseTexture = new BABYLON.Texture(
            "/textures/fur.jpg",
            scene
        );
        ropeMaterial.uScale = 1000;
        ropeMaterial.vScale = 10;
        this.materials.ropeMaterial = ropeMaterial

        let speckedMaterial = new BABYLON.StandardMaterial("", scene);
        speckedMaterial.diffuseTexture = new BABYLON.Texture(
            "/textures/speckledPlasticTexture.jpeg",
            scene
        );
        speckedMaterial.uScale = 1000;
        speckedMaterial.vScale = 10;
        this.materials.speckedMaterial = speckedMaterial



        let blackMaterial = new BABYLON.StandardMaterial("", scene);
        blackMaterial.diffuseTexture = new BABYLON.Texture(
            "/textures/blackTexture.png",
            scene
        );
        this.materials.blackMaterial = blackMaterial
    }

    createClosedLink(linkNumber, doubleEnd=0, bushing = 0) {
        let scene = this.scene
        const chainOuterLink1FrontBar = BABYLON.MeshBuilder.CreateBox("verticalLeg1", { height: this.chainDimensions.linkLength, width: this.chainDimensions.linkWidth, depth: this.chainDimensions.linkThickness });
        let chainOuterLink1End = BABYLON.MeshBuilder.CreateCylinder(
            "chainOuterLink1End", {
            height: this.chainDimensions.linkThickness,
            diameter: this.chainDimensions.linkWidth
        });
        chainOuterLink1End.rotation.x = Math.PI / 2
        chainOuterLink1End.position.y = chainOuterLink1FrontBar.position.y - this.chainDimensions.linkLength / 2
        let chainOuterLink1End2 = chainOuterLink1End.clone("chainOuterLink1End2")
        chainOuterLink1End2.position.y = -chainOuterLink1End.position.y
        let chainOuterLink1Front = BABYLON.Mesh.MergeMeshes([
            chainOuterLink1FrontBar,
            chainOuterLink1End,
            chainOuterLink1End2
        ]);

        let chainOuterLink1Back = chainOuterLink1Front.clone("chainOuterLink1Back")

        let chainRivet1 = BABYLON.MeshBuilder.CreateCylinder(
            "chainRivet1", {
            height: this.chainDimensions.chainRivetLength,
            diameter: this.chainDimensions.chainRivetDia
        }
        );
        chainOuterLink1Front.position.z = (chainRivet1.position.z - this.chainDimensions.chainRivetLength / 2 + this.chainDimensions.linkThickness / 2 + 5)
        chainRivet1.rotation.x = Math.PI / 2
        chainRivet1.position.y = chainOuterLink1Front.position.y - this.chainDimensions.linkLength / 2
        const chainRivet2 = chainRivet1.clone("chainRivet2")
        chainRivet2.position.y = chainOuterLink1Front.position.y + this.chainDimensions.linkLength / 2
        chainOuterLink1Back.position.z = -chainOuterLink1Front.position.z

        let chainBearing1 = BABYLON.MeshBuilder.CreateCylinder(
            "chainBearing1", {
            height: (Math.abs(chainOuterLink1Back.position.z - chainOuterLink1Front.position.z) - this.chainDimensions.linkThickness - 1),//-this.chainDimensions.linkLength/2) -5,
            diameter: this.chainDimensions.linkWidth - 4
        });
        chainBearing1.rotation.x = Math.PI / 2
        chainBearing1.position.y = chainRivet1.position.y
        const chainBearing2 = chainBearing1.clone("chainBearing2")
        chainBearing2.position.y = chainRivet2.position.y


        let chainLink = BABYLON.Mesh.MergeMeshes([
            chainOuterLink1Front,
            chainOuterLink1Back
        ]);


        let chainRivets = BABYLON.Mesh.MergeMeshes([
            chainRivet1,
            chainRivet2
        ]);

        let chainBearings = BABYLON.Mesh.MergeMeshes([
            chainBearing1,
            chainBearing2
        ]);

       
        let ropeKnot = false
        chainRivets.material = this.materials.blackMaterial
        if(doubleEnd != 0){
            let doubleEndOffset = -((Math.abs(chainOuterLink1Back.position.z - chainOuterLink1Front.position.z))  + this.chainDimensions.linkThickness/2)
            doubleEndOffset = doubleEnd/(Math.abs(doubleEnd)) * doubleEndOffset
            let tmp = chainLink.clone("chainLinkDouble")
            tmp.position.z = doubleEndOffset
            chainLink = BABYLON.Mesh.MergeMeshes([
                chainLink,
                tmp
            ]);
            
            tmp = chainBearings.clone("chainBearingsDouble")
            tmp.position.z = doubleEndOffset
            chainBearings = BABYLON.Mesh.MergeMeshes([
                chainBearings,
                tmp
            ]);

            ropeKnot = BABYLON.MeshBuilder.CreateCylinder(
                "ropeKnot", {
                height: (Math.abs(chainOuterLink1Back.position.z - chainOuterLink1Front.position.z) - this.chainDimensions.linkThickness - 1)/4,//-this.chainDimensions.linkLength/2) -5,
                diameter: (this.chainDimensions.linkWidth - 4)*4
            });
            

            tmp = chainRivets.clone("chainRivetsDouble")
            tmp.position.z = doubleEndOffset
            ropeKnot.rotation.x = Math.PI/2
            ropeKnot.position.y = chainRivet1.position.y
            ropeKnot.position.z = tmp.position.z
            chainRivets = BABYLON.Mesh.MergeMeshes([
                chainRivets,
                tmp
            ]);
            tmp = new BABYLON.TransformNode();
            chainRivets.material = this.materials.blackMaterial
            chainRivets.parent = tmp
            ropeKnot.parent = tmp
            chainRivets = tmp
            this.knotCenterZ = tmp.position.z
        }   

        if (bushing !== 0){
            let washerHeight = (Math.abs(chainOuterLink1Back.position.z - chainOuterLink1Front.position.z) - this.chainDimensions.linkThickness )/4
            let washer = BABYLON.MeshBuilder.CreateCylinder(
                "washer", {
                height: washerHeight,
                diameter: this.chainDimensions.linkWidth - 4
            });
            washer.rotation.x = Math.PI / 2
            washer.position.y = chainRivet2.position.y
            let washerOffset = chainOuterLink1Front.position.z - this.chainDimensions.linkThickness/2 - washerHeight/2
            this.endOfWasher = washerOffset - (this.chainDimensions.linkWidth - 4)/2
            // washerOffset = -50
            washer.position.z = washerOffset * bushing/(Math.abs(bushing))
            if(Math.abs(bushing) ==2){
                let washer1 = washer.clone("washer1")
                washer1.position.y = chainRivet1.position.y
                chainBearings = BABYLON.Mesh.MergeMeshes([
                    chainBearings,
                    washer,
                    washer1
                ]);
            }else{
                chainBearings = BABYLON.Mesh.MergeMeshes([
                    chainBearings,
                    washer
                ]);
            }
            
        }
        chainLink.material = this.materials.aluminiumMaterial
       
        chainBearings.material = this.materials.woodMaterial
        return {
            chainLink,
            chainRivets,
            chainBearings,
            y0: chainOuterLink1End.position.y,
            R: Math.abs(chainOuterLink1End.position.y),
            ropeKnot
        }
    }

    createOpenLink(linkNumber, doubleEnd) {
        let scene = this.scene
        const chainOuterLink1FrontBar = BABYLON.MeshBuilder.CreateBox("verticalLeg1", { height: this.chainDimensions.linkLength, width: this.chainDimensions.linkWidth, depth: this.chainDimensions.linkThickness });
        let chainOuterLink1End = BABYLON.MeshBuilder.CreateCylinder(
            "chainOuterLink1End", {
            height: this.chainDimensions.linkThickness,
            diameter: this.chainDimensions.linkWidth
        });
        chainOuterLink1End.rotation.x = Math.PI / 2
        chainOuterLink1End.position.y = chainOuterLink1FrontBar.position.y - this.chainDimensions.linkLength / 2
        let chainOuterLink1End2 = chainOuterLink1End.clone("chainOuterLink1End2")
        chainOuterLink1End2.position.y = -chainOuterLink1End.position.y
        let chainOuterLink1Front = BABYLON.Mesh.MergeMeshes([
            chainOuterLink1FrontBar,
            chainOuterLink1End,
            chainOuterLink1End2
        ]);
        // chainOuterLink1Front.rotation.z = Math.PI / 2
        chainOuterLink1Front.position.z = (0 - this.chainDimensions.chainRivetLength / 2 + 5 + this.chainDimensions.linkThickness * 1.5 + 1)
        let chainOuterLink1Back = chainOuterLink1Front.clone("chainOuterLink1Back")
        chainOuterLink1Back.position.z = -chainOuterLink1Front.position.z

        let chainLink = BABYLON.Mesh.MergeMeshes([
            chainOuterLink1Front,
            chainOuterLink1Back
        ]);

        if(doubleEnd != 0){
            let doubleEndOffset = chainOuterLink1End.position.y + this.chainDimensions.linkThickness/2
            doubleEndOffset = doubleEnd/(Math.abs(doubleEnd)) * doubleEndOffset
            let tmp = chainLink.clone("chainLinkDouble")
            tmp.position.z = doubleEndOffset
            chainLink = BABYLON.Mesh.MergeMeshes([
                chainLink,
                tmp
            ]);
        }


        // chainLink.material = this.materials.wood1Material
        chainLink.material = this.materials.aluminiumMaterial
        return {
            chainLink,
            y0: chainOuterLink1End.position.y,
            R: Math.abs(chainOuterLink1End.position.y)
        }
    }

    createRope() {
        let scene = this.scene
        let cable = BABYLON.MeshBuilder.CreateCylinder(
            "cable", {
            height: 2000,
            diameter: this.chainDimensions.linkWidth * 2
        });
        cable.rotation.z = Math.PI / 2
        cable.material = this.materials.ropeMaterial
    }

    positionLinks(links, theta, offset=false) {
        let chainWhole = new BABYLON.TransformNode();
        let origin = [0, 0, 0]
        let { y0, R } = links[0]
        // y0 = Math.round(R * Math.cos(degree2Pi(theta)))
        y0 = R * Math.cos(degree2Pi(theta))
        let x0 = 0
        let X0 = x0, Y0 = R//y0
        let lastX = links.length * 2 * R * Math.sin(degree2Pi(theta))
        let yOffset = -(R * Math.cos(degree2Pi(theta)) - this.chainDimensions.linkWidth - this.chainDimensions.linkWidth / 4)
        // let yOffset =  0//-this.chainDimensions.linkWidth
        // console.log({ X0, Y0, R })
        for (let i in links) {
            let thetaInner = (parseInt(i) % 2 == 1) ? -theta : theta
            links[i].chainLink.setPivotPoint(new BABYLON.Vector3(X0, Y0, 0));
            links[i].chainLink.rotation.z += degree2Pi(thetaInner) - links[i].chainLink.rotation.z

            if (parseInt(i) % 2 == 0) {
                links[i].chainRivets.setPivotPoint(new BABYLON.Vector3(X0, Y0, 0));
                links[i].chainBearings.setPivotPoint(new BABYLON.Vector3(X0, Y0, 0));
                links[i].chainRivets.rotation.z = degree2Pi(thetaInner)
                links[i].chainBearings.rotation.z = degree2Pi(thetaInner)
                links[i].chainRivets.setPivotPoint(new BABYLON.Vector3(0, 0, 0));
                links[i].chainBearings.setPivotPoint(new BABYLON.Vector3(0, 0, 0));
                links[i].chainRivets.position.y = yOffset
                links[i].chainBearings.position.y = yOffset
                links[i].chainRivets.position.x = R * Math.sin(degree2Pi(theta))  - (!offset?(lastX / 2):-offset)
                links[i].chainBearings.position.x = R * Math.sin(degree2Pi(theta))  - (!offset?(lastX / 2):-offset)
            }

            links[i].chainLink.setPivotPoint(new BABYLON.Vector3(0, 0, 0));
            links[i].chainLink.position.y = yOffset
            links[i].chainLink.position.x = R * Math.sin(degree2Pi(theta)) - (!offset?(lastX / 2):-offset)
            // links[i].chainLink.position.x = R * Math.sin(degree2Pi(theta)) - lastX / 2
            if (parseInt(i) > 0) {
                try {
                    links[i].chainLink.position.x += parseInt(i) * 2 * R * Math.sin(degree2Pi(theta))
                    links[i].chainRivets.position.x += parseInt(i) * 2 * R * Math.sin(degree2Pi(theta))
                    links[i].chainBearings.position.x += parseInt(i) * 2 * R * Math.sin(degree2Pi(theta))
                } catch (err) {
                }
            }
            try{
                links[i].chainLink.parent = chainWhole
                links[i].chainRivets.parent = chainWhole
                links[i].chainBearings.parent = chainWhole
            }catch(err){}
            // console.log("SETTING INTERVAL......", "chainSim", links[i].ropeKnot)
        }
        if(offset && offset > 0){
            chainWhole.setPivotPoint(new BABYLON.Vector3(offset, 0, 0));
            chainWhole.rotation.z = Math.PI
            chainWhole.rotation.x = Math.PI
        }
    }


    createChain(simulate = false, numLinks = 10, offset=false, theta=10, doubleEnd = 0, bushing = 0) {
        let links = []
        let numLink = 0
        while (true) {
            if (++numLink % 2 != 0) {
                console.log(doubleEnd?numLink===numLinks?true:false:false, doubleEnd)
                // links.push(this.createClosedLink(numLink, doubleEnd!==0?numLink===numLinks?true:false:false))
                links.push(this.createClosedLink(numLink, numLink===numLinks?doubleEnd:0, numLink===1?bushing:0))
            } else {
                // links.push(this.createOpenLink(numLink,doubleEnd!==0?numLink===numLinks?true:false:false))
                links.push(this.createOpenLink(numLink,numLink===numLinks?doubleEnd:0, numLink===1?bushing:0))
            }
            if (numLink === numLinks) break
        }
        // this.links = links
        let thetaMin = 10, thetaMax = 60
        let interInterval = 1
        let interval = interInterval
       
        this.positionLinks(links,theta, offset)
        if (simulate) {
            let chainSiminterval = setInterval(() => {
                this.positionLinks(links,theta ,offset)
                theta += interval
                if (theta >= thetaMax) interval = -interInterval
                if (theta <= thetaMin) interval = interInterval
            }, 100)
            this.intervals["chainSim"] = chainSiminterval
        }
        return links
    }

    initChainOnly() {
        this.createChain(true, 11)
        this.createRope()
    }

    positionBrakingMechanismLinks(links, offset) {
       for (let i in links) {
            links[i].chainLink.setPivotPoint(new BABYLON.Vector3(0, 0, 0));
            links[i].chainLink.position.x += offset
            try {
                links[i].chainRivets.position.x += offset
                links[i].chainBearings.position.x += offset
            } catch (err) {

            }
        }
    }

    createBreakingMechanismBoard(){
        const mechanismBoard = BABYLON.MeshBuilder.CreateBox("mechanismBoard", { height: this.chainDimensions.board.width, width: this.chainDimensions.board.length, depth: this.chainDimensions.board.thickness });
        mechanismBoard.position.z = -(this.endOfWasher - this.chainDimensions.board.thickness/2)
        mechanismBoard.material = this.materials.wood1Material
    }

    initBreakingMechanism() {
        let chain1Links = this.createChain(true, 5, 600,    10,     -1, 1) // chain2
        let chain2Links = this.createChain(true, 5, -600,   10,     1, -1) //chain1
        let chain3Links = this.createChain(false, 1, -650,  0,      1, -2) //pulley1
        let chain5Links = this.createChain(false, 1, 650,   0,      -1, 2) //pulley2
        let chain4Links = this.createChain(false, 1, 0,     0,      0,  -2) //pulley
        this.createBreakingMechanismBoard()
        this.createRope()
        let offset = this.chainDimensions.board.length/4
        let knotPoints = []
        for(let i in chain2Links){
            if(chain2Links[i].ropeKnot){knotPoints.push(chain2Links[i].ropeKnot)
            console.log("Rope1", chain2Links[i].ropeKnot)
            }
        } 
        for(let i in chain3Links){
            if(chain3Links[i].ropeKnot){knotPoints.push(chain3Links[i].ropeKnot)
            console.log("Pulley1", chain3Links[i].ropeKnot)
            }
        } 
        for(let i in chain1Links){
            if(chain1Links[i].ropeKnot){knotPoints.push(chain1Links[i].ropeKnot)
            console.log("Rope2", chain1Links[i].ropeKnot)
            }
        } 
        for(let i in chain5Links){
            if(chain5Links[i].ropeKnot){knotPoints.push(chain5Links[i].ropeKnot)
            console.log("Pulley2")
            }

        }
        knotPoints.map(point=>console.log("===>", point.position.z, point.position.y, point.position.x))
        // console.log(knotPoints)
        // this.positionBrakingMechanismLinks(chain1Links, -offset)
        // this.positionBrakingMechanismLinks(chain2Links, offset)
    }


    init(elem, simulationType) {
        let children = elem.childNodes
        for (let j in children) {
            if (children[j].localName === "canvas") elem.removeChild(children[j]);
        }
        let canvas = document.createElement('canvas');
        canvas.className = "absolute-top full-width full-height"
        elem.append(canvas);
        this.canvas = canvas
        for (let i of Object.keys(this.intervals)) {
            clearInterval(this.intervals[i])
        }
        try {
            this.scene.dispose()
        } catch (error) { }

        let engine = new BABYLON.Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true
        });
        this.engine = engine
        let scene = new BABYLON.Scene(engine);
        this.scene = scene
        // scene.clearColor = new BABYLON.Color4
        scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        this.createCamera(scene)
        this.createMaterials()
        this.showAxis(100)

        switch (simulationType) {
            case "CHAINONLY":
                this.initChainOnly()
                break
            case "BRAKINGMECHANISM":
                this.initBreakingMechanism()
                break
            case "PARALLELBRAKE":
                this.initChainOnly()
                break
        }
        console.log(simulationType)
        var renderLoop = function () {
            scene.render();
        };
        engine.runRenderLoop(renderLoop);
    }

    createCamera = (scene) => {
        let self = this
        try {
            self.camera.dispose();
            self.light.dispose();
            self.light1.dispose();
            self.light2.dispose();
        } catch (error) {
            console.log(error)
        }
        let initialCamRadius = self.initialCamRadius;
        if (self.gardenPoints) {
            let { length } = this.soilDimensions(self);

            initialCamRadius = length;
            self.initialCamRadiusDouble =
                initialCamRadius *= 2
            self.initialCamRadiusDouble = initialCamRadius
            // console.log({initialCamRadius})
        }

        let camera = new BABYLON.ArcRotateCamera(
            "Camera", -Math.PI / 2,
            Math.PI / 4,
            initialCamRadius,
            new BABYLON.Vector3(0, 0, 10/*4.5*/),
            scene
        );
        addCameraControls(scene, camera, false);
        // Add map-like controls to an ArcRotate camera.
        function addCameraControls(scene, camera, debug) {
            camera.inertia = 0.9;
            camera.lowerRadiusLimit = 10;
            camera.upperRadiusLimit = 3 * initialCamRadius;
            camera.upperBetaLimit = Math.PI - 0.1;
            camera.angularSensibilityX = camera.angularSensibilityY = 500;
            updateHitPlane(scene, camera);
            const inertialPanning = BABYLON.Vector3.Zero();
            const inertialPanningFn = () => {
                if (inertialPanning.x !== 0 || inertialPanning.y !== 0 || inertialPanning.z !== 0) {
                    camera.target.addInPlace(inertialPanning);
                    inertialPanning.scaleInPlace(camera.inertia);
                    zeroIfClose(inertialPanning);
                }
            };
            const wheelPrecisionFn = () => {
                camera.wheelPrecision = 1 / camera.radius * 1000;
            };
            const zoomFn = (p, e) => {
                const delta = zoomWheel(p, e, camera);
                zooming(delta, scene, camera, inertialPanning);
            }
            const prvScreenPos = BABYLON.Vector2.Zero();
            const rotateFn = () => {
                rotating(scene, camera, prvScreenPos);
            };
            const removeObservers = () => {
                updateHitPlane(scene, camera);
                scene.onPointerObservable.removeCallback(rotateFn);
            }
            scene.onPointerObservable.add((p, e) => {
                removeObservers();
                if (p.event.button === 0) {
                    updateHitPlane(scene, camera);
                    prvScreenPos.copyFromFloats(scene.pointerX, scene.pointerY);
                    scene.onPointerObservable.add(rotateFn, BABYLON.PointerEventTypes.POINTERMOVE);
                }
            }, BABYLON.PointerEventTypes.POINTERDOWN);
            scene.onPointerObservable.add((p, e) => {
                removeObservers();
            }, BABYLON.PointerEventTypes.POINTERUP);
            scene.onPointerObservable.add(zoomFn, BABYLON.PointerEventTypes.POINTERWHEEL);
            scene.onBeforeRenderObservable.add(inertialPanningFn);
            scene.onBeforeRenderObservable.add(wheelPrecisionFn);
            // stop context menu showing on canvas right click
            scene.getEngine().getRenderingCanvas().addEventListener("contextmenu", (e) => {
                e.preventDefault();
            });
        }
        function updateHitPlane(scene, camera) {
            var debug = (camera.targetBox != null);
            var direction = camera.target.subtract(camera.position)
            camera.hitplane = BABYLON.Plane.FromPositionAndNormal(BABYLON.Vector3.Zero(), direction);
            // reproject the camera target onto the newly oriented hitplane, this brings
            // the target back closer to the center so it doesn't drift off into never neve land.
            var direction = camera.target.subtract(camera.position);
            var positionOnPlane = camera.position.projectOnPlane(camera.hitplane, camera.target);
            camera.target = positionOnPlane;
            var motion = 0.0 + camera.inertialAlphaOffset + camera.inertialBetaOffset + camera.inertialRadiusOffset;
            if (motion) {
                // still moving, so tricker another update in a little bit.  Unfortunately the camera has no 
                // callback when it has finished moving.  If this was implemented as new type of 
                // camera then we could do this update in the _checkInputs call and would not need
                // a timeout like this.
                window.setTimeout(() => { updateHitPlane(scene, camera), 100 });
            }
        }
        // Get pos on plane
        function getPosition(scene, camera) {
            var direction = camera.target.subtract(camera.position);
            direction.normalize();
            // to stop degenerate behavior when camera is aligned with a plane where hit detection shoots
            // off to infinity, we take the closest distance to any of the 3 x-y-z planes.
            var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera, false);
            const distance = ray.intersectsPlane(camera.hitplane);
            // not using this ray again, so modifying its vectors here is fine
            return ray.origin.addInPlace(ray.direction.scaleInPlace(distance));
        }
        // Get the wheel delta divided by the camera wheel precision.
        // This code is borrowed from the internals of ArcRotateCamera.
        function zoomWheel(p, e, camera) {
            const event = p.event;
            event.preventDefault();
            let wheelDelta = 0;
            if (event.wheelDelta) {
                wheelDelta = event.wheelDelta;
            } else {
                wheelDelta = -(event.deltaY || event.detail) * 60;
            }
            var delta = wheelDelta / (camera.wheelPrecision * 10);
            return delta;
        }
        // Zoom to pointer position. Zoom amount determined by delta.
        function zooming(delta, scene, camera, ref) {
            // console.log(delta, scene, camera, ref)
            if (camera.radius - camera.lowerRadiusLimit < 1 && delta > 0) {
                return;
            } else if (camera.upperRadiusLimit - camera.radius < 1 && delta < 0) {
                return;
            }
            const inertiaComp = 1 - camera.inertia;
            if (camera.radius - (camera.inertialRadiusOffset + delta) / inertiaComp <
                camera.lowerRadiusLimit) {
                delta = (camera.radius - camera.lowerRadiusLimit) * inertiaComp - camera.inertialRadiusOffset;
            } else if (camera.radius - (camera.inertialRadiusOffset + delta) / inertiaComp >
                camera.upperRadiusLimit) {
                delta = (camera.radius - camera.upperRadiusLimit) * inertiaComp - camera.inertialRadiusOffset;
            }
            const zoomDistance = delta / inertiaComp;
            const ratio = zoomDistance / camera.radius;
            const vec = getPosition(scene, camera);
            const directionToZoomLocation = vec.subtract(camera.target);
            const offset = directionToZoomLocation.scale(ratio);
            offset.scaleInPlace(inertiaComp);
            ref.addInPlace(offset);

            camera.inertialRadiusOffset += delta;
            self.inertialRadiusOffset = camera.inertialRadiusOffset
        }
        // Rotate the camera
        function rotating(scene, camera, prvScreenPos) {
            const offsetX = scene.pointerX - prvScreenPos.x;
            const offsetY = scene.pointerY - prvScreenPos.y;
            prvScreenPos.copyFromFloats(scene.pointerX, scene.pointerY);
            // self.pointerX = scene.pointerX
            // self.pointerY = scene.pointerY
            changeInertialAlphaBetaFromOffsets(offsetX, offsetY, camera);
        }
        // Modifies the camera's inertial alpha and beta offsets.
        function changeInertialAlphaBetaFromOffsets(offsetX, offsetY, camera) {
            const alphaOffsetDelta = offsetX / camera.angularSensibilityX;
            const betaOffsetDelta = offsetY / camera.angularSensibilityY;
            self.cameraOpts = {
                alphaOffsetDelta, betaOffsetDelta
            }
            camera.inertialAlphaOffset -= alphaOffsetDelta;
            camera.inertialBetaOffset -= betaOffsetDelta;
            self.cameraOpts.alphaOffsetDelta = camera.inertialAlphaOffset
            self.cameraOpts.betaOffsetDelta = camera.inertialBetaOffset
            // console.log({
            //     alphaOffsetDelta:self.cameraOpts.alphaOffsetDelta,
            //     betaOffsetDelta:self.cameraOpts.betaOffsetDelta
            // })
        }
        // Sets x y or z of passed in vector to zero if less than Epsilon.
        function zeroIfClose(vec) {
            if (Math.abs(vec.x) < BABYLON.Epsilon) {
                vec.x = 0;
            }
            if (Math.abs(vec.y) < BABYLON.Epsilon) {
                vec.y = 0;
            }
            if (Math.abs(vec.z) < BABYLON.Epsilon) {
                vec.z = 0;
            }
        }

        let light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(1, initialCamRadius, 1), scene);
        light.range = initialCamRadius

        // EOCAMERA
        // let light = new BABYLON.HemisphericLight(
        //     "hemiLight",
        //     new BABYLON.Vector3(10, 10, 0),
        //     scene
        // );
        let light1 = new BABYLON.HemisphericLight(
            "hemiLight",
            // new BABYLON.Vector3(0, 10, 0),
            new BABYLON.Vector3(0, initialCamRadius, 0),
            scene
        );
        let light2 = new BABYLON.HemisphericLight(
            "hemiLight",
            new BABYLON.Vector3(0, -10, 0),
            scene
        );
        let degree2Pi = (degree) => {
            return (degree / 360) * (Math.PI * 2)
        }
        camera.lowerBetaLimit = -Math.PI / 2 + degree2Pi(1);
        camera.upperBetaLimit = Math.PI / 2 - degree2Pi(1);
        camera.maxZ = initialCamRadius * 2

        // if(self.cameraOpts && self.cameraOpts.alphaOffsetDelta !== undefined){
        //     console.log({
        //         alphaOffsetDelta:self.cameraOpts.alphaOffsetDelta,
        //         betaOffsetDelta:self.cameraOpts.betaOffsetDelta
        //     })
        //     if(!isNaN(self.cameraOpts.alphaOffsetDelta))
        //     camera.inertialAlphaOffset = self.cameraOpts.alphaOffsetDelta;
        //     if(!isNaN(self.cameraOpts.betaOffsetDelta))
        //     camera.inertialBetaOffset = self.cameraOpts.betaOffsetDelta;
        // }
        // if(self.inertialRadiusOffset){
        //     camera.inertialRadiusOffset = self.inertialRadiusOffset
        // }
        self.light = light
        self.light1 = light1
        self.light2 = light2
        self.camera = camera;
    }


    showAxis = (size) => {
        let scene = this.scene
        let makeTextPlane = function (text, color, size) {
            let dynamicTexture = new BABYLON.DynamicTexture(
                "DynamicTexture",
                50,
                scene,
                true
            );
            dynamicTexture.hasAlpha = true;
            dynamicTexture.drawText(
                text,
                5,
                40,
                "bold 36px Arial",
                color,
                "transparent",
                true
            );
            let plane = new BABYLON.Mesh.CreatePlane(
                "TextPlane",
                size,
                scene,
                true
            );
            plane.material = new BABYLON.StandardMaterial(
                "TextPlaneMaterial",
                scene
            );
            plane.material.backFaceCulling = false;
            plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
            plane.material.diffuseTexture = dynamicTexture;
            return plane;
        };
        let axisX = BABYLON.Mesh.CreateLines(
            "axisX",
            [
                new BABYLON.Vector3.Zero(),
                new BABYLON.Vector3(size, 0, 0),
                new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
                new BABYLON.Vector3(size, 0, 0),
                new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
            ],
            scene
        );
        axisX.color = new BABYLON.Color3(1, 0, 0);
        let xChar = makeTextPlane("X", "red", size / 10);
        xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
        let axisY = BABYLON.Mesh.CreateLines(
            "axisY",
            [
                new BABYLON.Vector3.Zero(),
                new BABYLON.Vector3(0, size, 0),
                new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
                new BABYLON.Vector3(0, size, 0),
                new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
            ],
            scene
        );
        axisY.color = new BABYLON.Color3(0, 1, 0);
        let yChar = makeTextPlane("Y", "green", size / 10);
        yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
        let axisZ = BABYLON.Mesh.CreateLines(
            "axisZ",
            [
                new BABYLON.Vector3.Zero(),
                new BABYLON.Vector3(0, 0, size),
                new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
                new BABYLON.Vector3(0, 0, size),
                new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
            ],
            scene
        );
        axisZ.color = new BABYLON.Color3(0, 0, 1);
        let zChar = makeTextPlane("Z", "blue", size / 10);
        zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    }


}
