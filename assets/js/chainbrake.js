function degree2Pi(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

class chainBrakeSimulator {
    chainParams = {
        centerDistance: 6,
        rivetDia: 1.8,
        bearingDia: 3.8,
        bearingLen: 1.6,
        rivetLen: 5.1
    }
    rope = {
        len: 300,
        dia: 1.0
    }
    chainPlateParams = {
        width: 2.4,
        thickness: 0.6,
        headDia: 4.3,
        headDiaInner: 4.8
    }
    breakingMechanism = {
        board: {
            length: 140,
            width: 30,
            thickness: 10
        },
        ropeDia: 0.2
    }

    materials = {}
    initialCamRadius = 100
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



        let blackMaterial = new BABYLON.StandardMaterial("", scene);
        blackMaterial.diffuseTexture = new BABYLON.Texture(
            "/textures/blackTexture.png",
            scene
        );
        this.materials.blackMaterial = blackMaterial

        let speckedMaterial = new BABYLON.StandardMaterial("", scene);
        speckedMaterial.diffuseTexture = new BABYLON.Texture(
            "/textures/speckledPlasticTexture.jpeg",
            scene
        );
        speckedMaterial.uScale = 1000;
        speckedMaterial.vScale = 10;
        this.materials.speckedMaterial = speckedMaterial
    }

    createRope() {
        let scene = this.scene
        let cable = BABYLON.MeshBuilder.CreateCylinder(
            "cable", {
            height: this.rope.len,
            diameter: this.rope.dia
        });
        cable.rotation.z = Math.PI / 2
        cable.material = this.materials.ropeMaterial
        return cable
    }

    getChainPoints(options = {}) {
        let defaults = {
            numLinks: 10,
            horizontalDirection: "FORWARD",
            verticalDirection: "DOWN",
            fixedAt: "CENTER",
            x0: 0,
            y0: 0,
            theta0: 30,
            chainLength: 0,
        }
        for (let i in defaults) {
            if (options[i] === undefined) options[i] = defaults[i]
        }
        let { numLinks, theta0, x0, y0, verticalDirection, horizontalDirection, chainLength, fixedAt } = options
        let { centerDistance } = this.chainParams
        if (chainLength > 0) { // calculate theta from it
            theta0 = Math.asin(chainLength / (centerDistance * (numLinks - 1)))
        } else { // calculate chainLength from theta
            chainLength = (numLinks) * centerDistance * Math.sin(degree2Pi(theta0))
        }
        x0 = fixedAt === "CENTER" ? (horizontalDirection === "BACK" ? -1 : 1) * (x0 - chainLength / 2) : x0

        let theta0_i = theta0 // verticalDirection === "DOWN"?-theta0: theta0

        let points = [] // {start, stop, angle}
        let linkIndex = 0;
        let chainPoints = []
        while (linkIndex++ < numLinks + 1) {
            let index = linkIndex - 1
            let theta_i = theta0_i * Math.pow(-1, linkIndex)
            let x_i = x0 + (horizontalDirection === "BACK" ? -1 : 1) * (index) * centerDistance * Math.sin(degree2Pi(theta0_i))
            let y_i = y0 + (verticalDirection === "DOWN" ? -1 : 1) * (index % 2) * centerDistance * Math.cos(degree2Pi(theta0_i))
            // console.log({x0, theta0, x_i, y_i})
            points.push(new BABYLON.Vector3(x_i, y_i, 0))
            chainPoints.push({ theta: theta0_i, x: x_i, y: y_i })
        }
        // let lines = BABYLON.MeshBuilder.CreateLines("lines", { points, updatable: true });
        // lines.color = new BABYLON.Color3(1, 0, 0);

        return chainPoints
    }

    createChainMeshes_test(options, chainPoints) {
        if (!options.startWith) options.startWith = "INNER"
        if (!options.doubleEnd) options.doubleEnd = 0
        let { centerDistance } = this.chainParams
        let { width, thickness } = this.chainPlateParams
        let { verticalDirection, horizontalDirection } = options
        let chainLinks = []
        let numPoints = chainPoints.length
        chainPoints.map((point, index) => {
            if (index === chainPoints.length - 1) return
            // if (index >0) return
            index = parseInt(index)

            let multiplier = verticalDirection === "DOWN" ?
                horizontalDirection === "FORWARD" ? 1 : -1 :
                horizontalDirection === "FORWARD" ? 1 : -1
            multiplier *= Math.pow(-1, index)
            /**
             * The chain link rectangular plate
             */
            const chainLinkBar1Plate = BABYLON.MeshBuilder.CreateBox("chainLinkBar1Plate", { height: centerDistance, width, depth: this.chainPlateParams.thickness });
            if (index % 2 != 0) {
                chainLinkBar1Plate.setPivotPoint(new BABYLON.Vector3(chainLinkBar1Plate.position.x, chainLinkBar1Plate.position.y + + (verticalDirection === "DOWN" ? -1 : 1) * centerDistance / 2, 0));
            } else {

                chainLinkBar1Plate.setPivotPoint(new BABYLON.Vector3(chainLinkBar1Plate.position.x, chainLinkBar1Plate.position.y + - (verticalDirection === "DOWN" ? -1 : 1) * centerDistance / 2, 0));
            }
            /**
             * The chain link circular end plate
             */
            let chainOuterLink1End = BABYLON.MeshBuilder.CreateCylinder(
                "chainOuterLink1End", {
                height: this.chainPlateParams.thickness,
                diameter: index % 2 == 0 ? this.chainPlateParams.headDia : this.chainPlateParams.headDiaInner
            });
            /*
             * Bearing
             */
            let chainBearing = BABYLON.MeshBuilder.CreateCylinder(
                "chainBearing", {
                height: this.chainParams.bearingLen,
                diameter: this.chainParams.bearingDia
            });
            /*
            * Rivet
            */
            let chainRivet = BABYLON.MeshBuilder.CreateCylinder(
                "chainRivet", {
                height: this.chainParams.rivetLen,
                diameter: this.chainParams.rivetDia
            });
            chainOuterLink1End.rotation.x = Math.PI / 2
            chainOuterLink1End.position.y = chainOuterLink1End.position.y - /*multiplier*/ -1 * centerDistance / 2
            chainBearing.rotation.x = Math.PI / 2
            chainRivet.rotation.x = Math.PI / 2



            let chainOuterLink2End = chainOuterLink1End.clone("chainOuterLink1End")
            chainOuterLink1End.position.x = chainLinkBar1Plate.position.x
            chainBearing.position.y = chainOuterLink1End.position.y + (index % 2 == 0 ? 0 : -1) /*multiplier*/ * centerDistance
            chainBearing.position.x = chainOuterLink1End.position.x
            // console.log({x:chainBearing.position.x, y:chainBearing.position.y })
            chainRivet.position.y = chainBearing.position.y
            chainRivet.position.x = chainOuterLink1End.position.x

            // chainOuterLink2End.position.y = chainPoints[index + 1].y //check. Its at the lower/upper end of the bar...
            // chainOuterLink2End.position.x = chainPoints[index + 1].x

            chainOuterLink2End.position.y = chainOuterLink1End.position.y + /*multiplier*/ -1 * centerDistance
            chainOuterLink2End.position.x = chainOuterLink1End.position.x

            let chainLinkBar1 = BABYLON.Mesh.MergeMeshes([
                chainLinkBar1Plate,
                chainOuterLink1End,
                chainOuterLink2End
            ]);
            let chainLinkBar2 = chainLinkBar1.clone("chainLinkBar1")
            let condition = options.startWith === "INNER" ? index % 2 != 0 : index % 2 == 0
            if (condition) {
                chainLinkBar1.position.z = - (this.chainParams.bearingLen / 2 + this.chainPlateParams.thickness / 2 + this.chainPlateParams.thickness)
            } else {
                chainLinkBar1.position.z = - (this.chainParams.bearingLen / 2 + this.chainPlateParams.thickness / 2)
            }
            chainLinkBar2.position.z = - chainLinkBar1.position.z
            let chainLinkBar = BABYLON.Mesh.MergeMeshes([
                chainLinkBar1,
                chainLinkBar2
            ]);
            if (condition) {
                chainLinkBar.material = this.materials.aluminiumMaterial
            } else {
                chainLinkBar.material = this.materials.speckedMaterial
            }
            chainRivet.material = this.materials.blackMaterial
            chainBearing.material = this.materials.woodMaterial

            let chainLink = new BABYLON.TransformNode();
            chainLinkBar.parent = chainLink
            chainRivet.parent = chainLink
            chainBearing.parent = chainLink

            if (index === chainPoints.length - 2) {
                if (options.doubleEnd !== 0) {
                    let chainLinkBar2 = chainLinkBar.clone("chainLinkBar2")
                    let chainRivet2 = chainRivet.clone("chainRivet2")
                    let chainBearing2 = chainBearing.clone("chainBearing2")
                    let multiplier = options.doubleEnd / Math.abs(options.doubleEnd)
                    chainBearing2.position.z = multiplier * (this.chainParams.bearingLen / 2 + this.chainPlateParams.thickness + this.chainPlateParams.thickness) * 2
                    chainRivet2.position.z = chainBearing2.position.z
                    chainLinkBar2.position.z = chainBearing2.position.z
                    chainRivet2.parent = chainLink
                    chainBearing2.parent = chainLink
                    chainLinkBar2.parent = chainLink

                    if (Math.abs(options.doubleEnd) === 2) {
                        let chainLinkBar3 = chainLinkBar.clone("chainLinkBar3")
                        let chainRivet3 = chainRivet.clone("chainRivet3")
                        let chainBearing3 = chainBearing.clone("chainBearing3")
                        multiplier = -multiplier
                        chainBearing3.position.z = multiplier * (this.chainParams.bearingLen / 2 + this.chainPlateParams.thickness + this.chainPlateParams.thickness) * 2
                        chainRivet3.position.z = chainBearing3.position.z
                        chainLinkBar3.position.z = chainBearing3.position.z
                        chainRivet3.parent = chainLink
                        chainBearing3.parent = chainLink
                        chainLinkBar3.parent = chainLink
                    }

                }
            }

            chainLinks.push(chainLink)
            // chainLink.position.y = point.y
            // chainLink.position.x = point.x
            if (index % 2 != 0) {
                chainLink.setPivotPoint(new BABYLON.Vector3(chainLinkBar1Plate.position.x, chainLinkBar1Plate.position.y + + (verticalDirection === "DOWN" ? -1 : 1) * centerDistance / 2, 0));
            } else {

                chainLink.setPivotPoint(new BABYLON.Vector3(chainLinkBar1Plate.position.x, chainLinkBar1Plate.position.y + - (verticalDirection === "DOWN" ? -1 : 1) * centerDistance / 2, 0));
            }

            // chainLink.rotation.z = degree2Pi(multiplier * 0)
            // console.table(chainLinkBar1Plate.position) 
            // console.table(point)
            // chainLink.position.y = point.y

            //check
            chainLink.position.x = point.x
            chainLink.rotation.z = degree2Pi(multiplier * point.theta)

            chainLink.position.y = point.y + (verticalDirection === "DOWN" ? -1 : 1) * (centerDistance) / 2
            chainLink.position.y -= index % 2 == 1 ? (verticalDirection === "DOWN" ? -1 : 1) * centerDistance : 0

            //doubleEnd

        })

        let point = chainPoints.slice(-1)[0]
        let chainBearing = BABYLON.MeshBuilder.CreateCylinder(
            "chainBearing", {
            height: this.chainParams.bearingLen,
            diameter: this.chainParams.bearingDia
        });
        let chainRivet = BABYLON.MeshBuilder.CreateCylinder(
            "chainRivet", {
            height: this.chainParams.rivetLen,
            diameter: this.chainParams.rivetDia
        });
        chainBearing.rotation.x = Math.PI / 2
        chainRivet.rotation.x = Math.PI / 2
        chainBearing.position.y = point.y
        chainRivet.position.y = point.y
        chainRivet.material = this.materials.blackMaterial
        chainBearing.material = this.materials.woodMaterial
        let chainLink = new BABYLON.TransformNode();
        chainRivet.parent = chainLink
        chainBearing.parent = chainLink
        chainLink.position.x = point.x

        if (options.doubleEnd !== 0) {
            let chainRivet2 = chainRivet.clone("chainRivet2")
            let chainBearing2 = chainBearing.clone("chainBearing2")
            let multiplier = options.doubleEnd / Math.abs(options.doubleEnd)
            chainBearing2.position.z = multiplier * (this.chainParams.bearingLen / 2 + this.chainPlateParams.thickness + this.chainPlateParams.thickness) * 2
            chainRivet2.position.z = chainBearing2.position.z
            chainRivet2.parent = chainLink
            chainBearing2.parent = chainLink


            if (Math.abs(options.doubleEnd) === 2) {
                multiplier = - multiplier
                let chainRivet3 = chainRivet.clone("chainRivet3")
                let chainBearing3 = chainBearing.clone("chainBearing3")
                chainBearing3.position.z = multiplier * (this.chainParams.bearingLen / 2 + this.chainPlateParams.thickness + this.chainPlateParams.thickness) * 2
                chainRivet3.position.z = chainBearing3.position.z
                chainRivet3.parent = chainLink
                chainBearing3.parent = chainLink
            }
        }

        chainLinks.push(chainLink)
        return chainLinks
    }


    createChain(options = {}, oldLinks = {}) {
        let chainPoints = this.getChainPoints(options)
        let chainLinks = this.createChainMeshes_test(options, chainPoints)
        return { chainLinks, chainPoints }
    }

    positionLinks_test(options = {}, chainPoints, chainLinks) {
        chainPoints = this.getChainPoints(options)
        let { centerDistance } = this.chainParams
        let { width, thickness } = this.chainPlateParams
        let { verticalDirection, horizontalDirection } = options
        chainPoints.map((point, index) => {
            index = parseInt(index)
            if (index === chainPoints.length - 1) {
                chainLinks[index].position.x = point.x
                return
            }
            chainLinks[index].position.x = point.x
            chainLinks[index].position.y = point.y + (verticalDirection === "DOWN" ? -1 : 1) * (centerDistance) / 2
            chainLinks[index].position.y -= index % 2 == 1 ? (verticalDirection === "DOWN" ? -1 : 1) * centerDistance : 0
            // chainLinks[index].rotation.z = degree2Pi(index % 2 != 0?options.theta0+ 180:-options.theta0)
            let multiplier = horizontalDirection === "FORWARD" ? -1 : 1;
            chainLinks[index].rotation.z = degree2Pi(index % 2 != 0 ? multiplier * options.theta0 : multiplier * -options.theta0)
        })
        return { chainPoints }
    }



    initChainOnly(simulate) {
        this.createRope()
        let options = {
            horizontalDirection: "BACK",
            verticalDirection: "DOWN",
            x0: 0,
            y0: (this.chainParams.bearingDia + this.rope.dia) / 2,
            fixedAt: "CENTER",
            numLinks: 10
        }
        let { chainLinks, chainPoints } = this.createChain(options)
        simulate = true
        this.positionLinks_test(options, chainPoints, chainLinks)
        if (simulate) {
            let thetaMin = 22, thetaMax = 40, theta = thetaMin
            let interval = 1
            theta = 22
            this.intervals["chain1"] = setInterval(() => {
                options.theta0 = theta
                // this.createChain(options, chainLinks)
                this.positionLinks_test(options, chainPoints, chainLinks)
                theta += interval
                if (theta === thetaMax) interval = -1
                if (theta === thetaMin) interval = 1
            }, 100)
        }
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

    // check
    createBreakingMechanismBoard() {
        const mechanismBoard = BABYLON.MeshBuilder.CreateBox("mechanismBoard", { height: this.breakingMechanism.board.width, width: this.breakingMechanism.board.length, depth: this.breakingMechanism.board.thickness });
        mechanismBoard.position.z = ((this.chainParams.bearingLen / 2 + this.chainPlateParams.thickness + this.chainPlateParams.thickness) * 2) * 1.5 + this.breakingMechanism.board.thickness / 2 //(this.endOfWasher - this.breakingMechanism.board.thickness / 2)
        mechanismBoard.material = this.materials.wood1Material
        return mechanismBoard
    }

    // check
    initBreakingMechanism(simulate = false, hasRope = true) {
        let board = this.createBreakingMechanismBoard()
        let rope;
       
        let chainLinksLeft, chainPointsLeft, chainLinksRight, chainPointsRight
        let breakingMechanism = new BABYLON.TransformNode();
        if(hasRope){
            
            rope = this.createRope()
            rope.parent = breakingMechanism
        } 
        let tmp
        /**
         * Middle
         */
        let optionsMiddle = {
            horizontalDirection: "FORWARD", // misses the Y and X???, when simulating misses the theta
            verticalDirection: "DOWN",
            x0: -0,
            // y0:  this.chainParams.centerDistance - (this.chainParams.bearingDia + this.rope.dia)/ 2,
            y0: (this.chainParams.bearingDia + this.rope.dia) / 2,
            fixedAt: "CENTER", startWith: "OUTER", doubleEnd: 1,
            numLinks: 1,
            theta0: 0
        }
        tmp = this.createChain(optionsMiddle)
        for (let i in tmp.chainLinks) {
            tmp.chainLinks[i].parent = breakingMechanism
        }
        let optionsMiddle1 = {
            horizontalDirection: "FORWARD", // misses the Y and X???, when simulating misses the theta
            verticalDirection: "DOWN",
            x0: -5,
            y0: (this.chainParams.bearingDia + this.rope.dia) / 2,
            fixedAt: "CENTER", startWith: "OUTER", doubleEnd: 1,
            numLinks: 1,
            theta0: 0
        }
        tmp = this.createChain(optionsMiddle1)
        for (let i in tmp.chainLinks) {
            tmp.chainLinks[i].parent = breakingMechanism
        }
        let optionsMiddle2 = {
            horizontalDirection: "FORWARD", // misses the Y and X???, when simulating misses the theta
            verticalDirection: "DOWN",
            x0: 5,
            y0: (this.chainParams.bearingDia + this.rope.dia) / 2,
            fixedAt: "CENTER", startWith: "OUTER", doubleEnd: 1,
            numLinks: 1,
            theta0: -0
        }
        tmp = this.createChain(optionsMiddle2)
        for (let i in tmp.chainLinks) {
            tmp.chainLinks[i].parent = breakingMechanism
        }

        /**
         * Left
         */
        let optionsEndLeft = {
            horizontalDirection: "FORWARD",
            verticalDirection: "DOWN",
            x0: -45,
            y0: (this.chainParams.bearingDia + this.rope.dia) / 2,
            fixedAt: "END", startWith: "OUTER", doubleEnd: 1,
            numLinks: 1,
            theta0: -30
        }
        tmp = this.createChain(optionsEndLeft)
        for (let i in tmp.chainLinks) {
            tmp.chainLinks[i].parent = breakingMechanism
        }
        let optionsEndLeft1 = {
            horizontalDirection: "FORWARD",
            verticalDirection: "DOWN",
            x0: -50,
            y0: (this.chainParams.bearingDia + this.rope.dia) / 2,
            fixedAt: "END", startWith: "OUTER", doubleEnd: 1,
            numLinks: 1,
            theta0: -30
        }
        tmp = this.createChain(optionsEndLeft1)
        for (let i in tmp.chainLinks) {
            tmp.chainLinks[i].parent = breakingMechanism
        }
        let optionsEndLeft2 = {
            horizontalDirection: "FORWARD",
            verticalDirection: "DOWN",
            x0: -55,
            y0: (this.chainParams.bearingDia + this.rope.dia) / 2,
            fixedAt: "END", startWith: "OUTER", doubleEnd: 2,
            numLinks: 1,
            theta0: -30
        }
        tmp = this.createChain(optionsEndLeft2)
        for (let i in tmp.chainLinks) {
            tmp.chainLinks[i].parent = breakingMechanism
        }

        /**
         * Right
         */

        let optionsEndRight = {
            horizontalDirection: "FORWARD",
            verticalDirection: "DOWN",
            x0: 45,
            y0: (this.chainParams.bearingDia + this.rope.dia) / 2,
            fixedAt: "END",
            numLinks: 1, startWith: "OUTER", doubleEnd: 1,
            theta0: 30
        }
        tmp = this.createChain(optionsEndRight)
        for (let i in tmp.chainLinks) {
            tmp.chainLinks[i].parent = breakingMechanism
        }
        let optionsEndRight1 = {
            horizontalDirection: "FORWARD",
            verticalDirection: "DOWN",
            x0: 50,
            y0: (this.chainParams.bearingDia + this.rope.dia) / 2,
            fixedAt: "END", startWith: "OUTER", doubleEnd: 1,
            numLinks: 1,
            theta0: 30
        }
        tmp = this.createChain(optionsEndRight1)
        for (let i in tmp.chainLinks) {
            tmp.chainLinks[i].parent = breakingMechanism
        }
        let optionsEndRight2 = {
            horizontalDirection: "FORWARD",
            verticalDirection: "DOWN",
            x0: 55,
            y0: (this.chainParams.bearingDia + this.rope.dia) / 2,
            fixedAt: "END", startWith: "OUTER", doubleEnd: 2,
            numLinks: 1,
            theta0: 30
        }
        tmp = this.createChain(optionsEndRight2)
        for (let i in tmp.chainLinks) {
            tmp.chainLinks[i].parent = breakingMechanism
        }

        let optionsLeft = {
            horizontalDirection: "FORWARD", // misses the Y and X???, when simulating misses the theta
            verticalDirection: "DOWN",
            x0: -45,
            y0: (this.chainParams.bearingDia + this.rope.dia) / 2,
            fixedAt: "END", startWith: "INNER", doubleEnd: -1,
            numLinks: 6
        }
        let optionsRight = {
            horizontalDirection: "BACK", // misses the Y and X???, when simulating misses the theta
            verticalDirection: "DOWN",
            x0: 45,
            y0: (this.chainParams.bearingDia + this.rope.dia) / 2,
            fixedAt: "END", startWith: "INNER", doubleEnd: -1,
            numLinks: 6
        }

        {
            let { chainLinks, chainPoints } = this.createChain(optionsLeft)
            chainLinksLeft = chainLinks
            chainPointsLeft = chainPoints
        }
        {
            let { chainLinks, chainPoints } = this.createChain(optionsRight)
            chainLinksRight = chainLinks
            chainPointsRight = chainPoints
        }

        optionsLeft.theta0 = 30
        optionsRight.theta0 = 30
        chainPointsLeft = this.positionLinks_test(optionsLeft, chainPointsLeft, chainLinksLeft).chainPoints
        chainPointsRight = this.positionLinks_test(optionsRight, chainPointsRight, chainLinksRight).chainPoints


        let spring = this.createBreakingMechanismSpring({ chainPointsLeft, chainPointsRight })

        spring.parent = breakingMechanism
        board.parent = breakingMechanism
        for (let i in chainLinksLeft) {
            chainLinksLeft[i].parent = breakingMechanism
            chainLinksRight[i].parent = breakingMechanism
        }

        let breakingRopes = this.createBreakingMechanismRopes({ chainPointsLeft, chainPointsRight, leftEnd: optionsEndLeft2, rightEnd: optionsEndRight2 })
        breakingRopes.map(breakingRope => breakingRope.parent = breakingMechanism)
        // chainLinkBar.parent = breakingMechanism
        // chainRivet.parent = breakingMechanism
        // chainBearing.parent = breakingMechanism

        if (simulate) {
            let thetaMin = 22, thetaMax = 40, theta = thetaMin
            let interval = 1
            theta = 22
            this.intervals["chain1"] = setInterval(() => {
                optionsLeft.theta0 = theta
                optionsRight.theta0 = theta
                chainPointsLeft = this.positionLinks_test(optionsLeft, chainPointsLeft, chainLinksLeft).chainPoints
                chainPointsRight = this.positionLinks_test(optionsRight, chainPointsRight, chainLinksRight).chainPoints

                breakingRopes = this.createBreakingMechanismRopes({ chainPointsLeft, chainPointsRight, leftEnd: optionsEndLeft2, rightEnd: optionsEndRight2, ropes: breakingRopes })

                // chainPointsLeft = this.positionLinks_test(optionsLeft, chainPointsLeft, chainLinksLeft).chainPoints
                // chainPointsRight = this.positionLinks_test(optionsRight, chainPointsRight, chainLinksRight).chainPoints
                spring = this.createBreakingMechanismSpring(
                    { chainPointsLeft, chainPointsRight, spring }
                )
                theta += interval
                if (theta === thetaMax) interval = -1
                if (theta === thetaMin) interval = 1
            }, 100)
        }
        return { breakingMechanism, chainLinksLeft, chainLinksRight, chainPointsLeft, chainPointsRight, optionsLeft, optionsRight, leftEnd: optionsEndLeft2, rightEnd: optionsEndRight2, ropes: breakingRopes, spring , _rope: rope}
    }

    initParallelBrake(simulate) {
        let mechanism1 = this.initBreakingMechanism()
        let mechanism2 = this.initBreakingMechanism()

        mechanism1.breakingMechanism.rotation.z = Math.PI
        mechanism1.breakingMechanism.position.x = - this.breakingMechanism.board.length / 2 - 5
        // mechanism2.breakingMechanism.rotation.z = Math.PI/2
        mechanism2.breakingMechanism.position.x = this.breakingMechanism.board.length / 2 + 5

        if (simulate) {
            let thetaMin = 22, thetaMax = 40, theta = thetaMin
            let interval0 = thetaMax - thetaMin
            let interval = interval0
            theta = 22
            this.intervals["chain1"] = setInterval(() => {
                mechanism1.optionsLeft.theta0 = theta
                mechanism1.optionsRight.theta0 = theta
                mechanism1.chainPointsLeft = this.positionLinks_test(mechanism1.optionsLeft, mechanism1.chainPointsLeft, mechanism1.chainLinksLeft).chainPoints
                mechanism1.chainPointsRight = this.positionLinks_test(mechanism1.optionsRight, mechanism1.chainPointsRight, mechanism1.chainLinksRight).chainPoints

                mechanism2.optionsLeft.theta0 = thetaMax - (theta - thetaMin)
                mechanism2.optionsRight.theta0 = thetaMax - (theta - thetaMin)
                mechanism2.chainPointsLeft = this.positionLinks_test(mechanism2.optionsLeft, mechanism2.chainPointsLeft, mechanism2.chainLinksLeft).chainPoints
                mechanism2.chainPointsRight = this.positionLinks_test(mechanism2.optionsRight, mechanism2.chainPointsRight, mechanism2.chainLinksRight).chainPoints

                mechanism1.ropes = this.createBreakingMechanismRopes({ chainPointsLeft: mechanism1.chainPointsLeft, chainPointsRight: mechanism1.chainPointsRight, leftEnd: mechanism1.leftEnd, rightEnd: mechanism1.rightEnd, ropes: mechanism1.ropes })
                mechanism1.spring = this.createBreakingMechanismSpring(
                    { chainPointsLeft: mechanism1.chainPointsLeft, chainPointsRight: mechanism1.chainPointsRight, spring: mechanism1.spring }
                )

                mechanism2.ropes = this.createBreakingMechanismRopes({ chainPointsLeft: mechanism2.chainPointsLeft, chainPointsRight: mechanism2.chainPointsRight, leftEnd: mechanism2.leftEnd, rightEnd: mechanism2.rightEnd, ropes: mechanism2.ropes })
                mechanism2.spring = this.createBreakingMechanismSpring(
                    { chainPointsLeft: mechanism2.chainPointsLeft, chainPointsRight: mechanism2.chainPointsRight, spring: mechanism2.spring }
                )
                theta += interval
                if (theta === thetaMax) interval = -interval0
                if (theta === thetaMin) interval = interval0
            }, 3000)
        }
    }
    
    initSeriesBrake(simulate) {
        let mechanism1 = this.initBreakingMechanism()
        let mechanism2 = this.initBreakingMechanism()

        mechanism1.breakingMechanism.rotation.z = Math.PI/2
        mechanism1.breakingMechanism.position.x = - this.breakingMechanism.board.width / 2
        mechanism2.breakingMechanism.position.x = this.breakingMechanism.board.width / 2
        mechanism2.breakingMechanism.rotation.z = Math.PI/2

        if (simulate) {
            let thetaMin = 22, thetaMax = 40, theta = thetaMin
            let interval0 = thetaMax - thetaMin
            let interval = interval0
            theta = 22
            this.intervals["chain1"] = setInterval(() => {
                mechanism1.optionsLeft.theta0 = theta
                mechanism1.optionsRight.theta0 = theta
                mechanism1.chainPointsLeft = this.positionLinks_test(mechanism1.optionsLeft, mechanism1.chainPointsLeft, mechanism1.chainLinksLeft).chainPoints
                mechanism1.chainPointsRight = this.positionLinks_test(mechanism1.optionsRight, mechanism1.chainPointsRight, mechanism1.chainLinksRight).chainPoints

                mechanism2.optionsLeft.theta0 = thetaMax - (theta - thetaMin)
                mechanism2.optionsRight.theta0 = thetaMax - (theta - thetaMin)
                mechanism2.chainPointsLeft = this.positionLinks_test(mechanism2.optionsLeft, mechanism2.chainPointsLeft, mechanism2.chainLinksLeft).chainPoints
                mechanism2.chainPointsRight = this.positionLinks_test(mechanism2.optionsRight, mechanism2.chainPointsRight, mechanism2.chainLinksRight).chainPoints

                mechanism1.ropes = this.createBreakingMechanismRopes({ chainPointsLeft: mechanism1.chainPointsLeft, chainPointsRight: mechanism1.chainPointsRight, leftEnd: mechanism1.leftEnd, rightEnd: mechanism1.rightEnd, ropes: mechanism1.ropes })
                mechanism1.spring = this.createBreakingMechanismSpring(
                    { chainPointsLeft: mechanism1.chainPointsLeft, chainPointsRight: mechanism1.chainPointsRight, spring: mechanism1.spring }
                )

                mechanism2.ropes = this.createBreakingMechanismRopes({ chainPointsLeft: mechanism2.chainPointsLeft, chainPointsRight: mechanism2.chainPointsRight, leftEnd: mechanism2.leftEnd, rightEnd: mechanism2.rightEnd, ropes: mechanism2.ropes })
                mechanism2.spring = this.createBreakingMechanismSpring(
                    { chainPointsLeft: mechanism2.chainPointsLeft, chainPointsRight: mechanism2.chainPointsRight, spring: mechanism2.spring }
                )
                theta += interval
                if (theta === thetaMax) interval = -interval0
                if (theta === thetaMin) interval = interval0
            }, 3000)
        }
    }

    createBreakingMechanismRopes(options) {
        // (options.ropes || []).map(rope => rope.dispose())
        options.ropes = options.ropes || []
        let { chainPointsLeft, chainPointsRight, leftEnd, rightEnd } = options
        let springZ = -(this.chainParams.bearingLen / 2 + this.chainPlateParams.thickness + this.chainPlateParams.thickness) * 2

        chainPointsRight.slice(-2)[0].x - chainPointsLeft.slice(-2)[0].x
        let yOffset = this.chainParams.bearingDia / 2 + this.breakingMechanism.ropeDia / 2
        let path = [
            new BABYLON.Vector3(chainPointsLeft.slice(-1)[0].x, chainPointsLeft.slice(-1)[0].y + yOffset, springZ),
            new BABYLON.Vector3(leftEnd.x0, leftEnd.y0 + yOffset, springZ)
        ];

        //Create ribbon with updatable parameter set to true for later changes
        let ropeSection1
        if (!options.ropes[0])
            ropeSection1 = BABYLON.MeshBuilder.CreateTube("ropeSection1", { path: path, radius: this.breakingMechanism.ropeDia, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: true });
        else
            ropeSection1 = BABYLON.MeshBuilder.CreateTube("ropeSection1", { path: path, radius: this.breakingMechanism.ropeDia, instance: options.ropes[0] });
        let material = new BABYLON.StandardMaterial("", this.scene);
        material.alpha = 1;
        // material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7);
        // material.diffuseColor = new BABYLON.Color3(0, 0.2, 0.7);
        material.diffuseColor = new BABYLON.Color3(1, 0.2, 0);
        ropeSection1.material = material

        path = [
            new BABYLON.Vector3(leftEnd.x0, chainPointsLeft.slice(-1)[0].y - yOffset, springZ),
            new BABYLON.Vector3(chainPointsRight.slice(-1)[0].x, leftEnd.y0 - yOffset, springZ)
        ];

        let ropeSection2
        if (!options.ropes[1])
            ropeSection2 = BABYLON.MeshBuilder.CreateTube("ropeSection2", { path: path, radius: this.breakingMechanism.ropeDia, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: true });
        else
            ropeSection2 = BABYLON.MeshBuilder.CreateTube("ropeSection2", { path: path, radius: this.breakingMechanism.ropeDia, instance: options.ropes[1] });

        ropeSection2.material = material

        let material1 = new BABYLON.StandardMaterial("", this.scene);
        material1.alpha = 1;
        material1.diffuseColor = new BABYLON.Color3(0, 0.2, 0.7);

        path = [
            new BABYLON.Vector3(chainPointsRight.slice(-1)[0].x, leftEnd.y0 - yOffset, springZ),
            new BABYLON.Vector3(rightEnd.x0 + (chainPointsRight.slice(-1)[0].x - chainPointsLeft.slice(-1)[0].x) / 2, leftEnd.y0 - yOffset, springZ)
        ];

        let ropeSection3
        if (!options.ropes[2])
            ropeSection3 = BABYLON.MeshBuilder.CreateTube("ropeSection3", { path: path, radius: this.breakingMechanism.ropeDia, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: true });
        else
            ropeSection3 = BABYLON.MeshBuilder.CreateTube("ropeSection3", { path: path, radius: this.breakingMechanism.ropeDia, instance: options.ropes[2] });

        ropeSection3.material = material1


        path = []
        let bigRadius = this.chainParams.bearingDia / 2 + this.breakingMechanism.ropeDia / 2
        for (let theta = 0; theta <= 180; theta += 30) {
            let thetaRadians = degree2Pi(theta)
            path.push(new BABYLON.Vector3(leftEnd.x0 - bigRadius * Math.sin(thetaRadians), leftEnd.y0 - bigRadius * -Math.cos(thetaRadians), springZ))
        }

        let ropeSection4
        if (!options.ropes[3])
            ropeSection4 = BABYLON.MeshBuilder.CreateTube("ropeSection4", { path: path, radius: this.breakingMechanism.ropeDia, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: true });
        else
            ropeSection4 = BABYLON.MeshBuilder.CreateTube("ropeSection4", { path: path, radius: this.breakingMechanism.ropeDia, instance: options.ropes[3] });
        ropeSection4.material = material


        path = []
        for (let theta = 0; theta <= 360; theta += 30) {
            let thetaRadians = degree2Pi(theta)
            path.push(new BABYLON.Vector3(chainPointsRight.slice(-1)[0].x - bigRadius * Math.sin(thetaRadians), chainPointsRight.slice(-1)[0].y - bigRadius * -Math.cos(thetaRadians), springZ))
        }

        let ropeSection5
        if (!options.ropes[4])
            ropeSection5 = BABYLON.MeshBuilder.CreateTube("ropeSection5", { path: path, radius: this.breakingMechanism.ropeDia, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: true });
        else ropeSection5 = BABYLON.MeshBuilder.CreateTube("ropeSection5", { path: path, radius: this.breakingMechanism.ropeDia, instance: options.ropes[4] });
        ropeSection5.material = material1

        return [ropeSection1, ropeSection2, ropeSection3, ropeSection4, ropeSection5]
    }


    createBreakingMechanismSpring(options) {
        let { chainPointsLeft, chainPointsRight } = options
        // if (options.spring) {
        //     console.log(options.spring.position.x)
        // }
        let springZ = (this.chainParams.bearingLen / 2 + this.chainPlateParams.thickness + this.chainPlateParams.thickness) * 2
        const makeCurve = (range, nbSteps, springRadius) => {
            const path = [];
            const stepSize = range / nbSteps;
            for (let i = -range / 2; i < range / 2; i += stepSize) {
                path.push(new BABYLON.Vector3(i, springRadius * Math.sin(i * nbSteps / 100), springRadius * Math.cos(i * nbSteps / 100)));
            }
            return path;
        };


        let springRadius = 1
        let springLenParam = chainPointsRight.slice(-2)[0].x - chainPointsLeft.slice(-2)[0].x
        let nbSteps = 100
        const curve = makeCurve(springLenParam, nbSteps, springRadius);
       
        /**
         * You can’t change the number of elements of the path array, only the values.
         * https://forum.babylonjs.com/t/tube-wont-update/18712/2
         */
        if(curve.length > nbSteps) curve.pop()

        let spring = options.spring
        if (!options.spring ) {
            spring = BABYLON.MeshBuilder.CreateTube("spring", { path: curve, radius: 0.1, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: true });
        } else {
            try {
                spring = BABYLON.MeshBuilder.CreateTube("spring", { path: curve, radius: 0.1, updatable: true, instance: spring});
                // spring = spring1
            } catch (error) {
                console.log(error)
            }
        }
        spring.position.z = -springZ
        spring.position.y = chainPointsLeft.slice(-2)[0].y

        const mat = this.materials.ropeMaterial
        mat.metallic = 0.0;
        mat.roughness = 1.0;
        mat.albedoColor = new BABYLON.Color3(1, 0, 0);
        mat.albedoTexture = new BABYLON.Texture('/textures/wood1.jpeg');
        spring.material = this.materials.ropeMaterial;
        return spring
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
       
        this.createMaterials()
        // this.showAxis(100)

        switch (simulationType) {
            case "CHAINONLY":
                this.initChainOnly(true)
                break
            case "BRAKINGMECHANISM":
                this.initialCamRadius = 150
                this.initBreakingMechanism(true)
                break
            case "PARALLELBRAKE":
                this.initialCamRadius = 300
                this.initParallelBrake(true)
                break
            case "SERIESBRAKE":
                this.initialCamRadius = 200
                this.initSeriesBrake(true)
                break
        }
        this.createCamera(scene)
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
            // console.log(error)
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
        //     scene...
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
