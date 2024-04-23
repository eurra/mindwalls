import { makeBuilder } from "../../src/mwcore/mindwalls.mjs";

let example = [    
    { type: "arrayFunc", func: { _ref: "suma" }, params: [ 
        { _var: 5 }, { _ref: "num" }
    ]},
    { 
        type: "mapFunc", func: {
            name: "pow",
            _const: function({base, exp}) { 
                return Math.pow(base, exp); 
            }
        }, 
        params: { 
            base: { _const: 2 },
            exp: { _var: 6 }
        }
    },
    { name: "num", _const: 5 },
    {
        _name: "suma", 
        _const: function(...nums) { 
            return nums.reduce((sum, curr) => sum + curr, 0); 
        } 
    }
]