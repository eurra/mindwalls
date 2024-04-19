import { wall, tracking, _const, _var, ref, arrayFunc, mapFunc } from "../../src/mwcore/mindwalls.mjs";

describe('MindWalls basics', function () {
    test('check basic usage of mindwalls core', mainTest)
});

function mainTest() {
    function suma() {
        this.load(arrayFunc, (...nums) => nums.reduce((sum, curr) => sum + curr, 0));
    };
    
    function pow() {
        this.load(mapFunc, ({ base, exp }) => Math.pow(base, exp));
    };
    
    let main = wall().loadForAll(tracking);
    
    let pow_ = main.make(ref).setName('ref_pow');
    let num3_ = main.make(ref).setName('ref_num3');
    let num4_ = main.make(ref).setName('ref_num4');
    
    let _suma = main.make(suma).setName('suma').
        append(main.make(_const, 1).setName('const 1')).
        append(main.make(_const, 2).setName('const 2'));
    
    expect(_suma.toString()).toBe('3');
    
    _suma.append(
        num3_.linkTo(main.make(_var, 4).setName('var 1'))
    );
        
    expect(num3_.toString()).toBe('4');
    expect(_suma.toString()).toBe('7');
      
    num3_.getTarget().setValue(8);
    expect(num3_.toString()).toBe('8');
    expect(_suma.toString()).toBe('11');

    //console.log(num3_.getTarget().getTracked().map((x) => x.getName()));
    
    pow_.linkTo(main.make(pow).
        setProp('base', main.make(_const, 2).setName('const 3')).
        setProp('exp', num4_.linkTo(main.make(_var, 8).setName('var 2')))
    );
    
    expect(pow_.toString()).toBe('256');
    
    num4_.getTarget().setValue(10);
    expect(pow_.toString()).toBe('1024');
}