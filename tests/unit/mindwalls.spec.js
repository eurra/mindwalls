import { instance, callStack, _const, _var, ref, arrayFunc, mapFunc } from "../../src/mwcore/mindwalls.mjs";

describe('MindWalls basics', function () {
    test('check basic usage of mindwalls core', mainTest)
});

function mainTest() {
    const suma = () => ({
        require: [[arrayFunc, (...nums) => nums.reduce((sum, curr) => sum + curr, 0)]]
    });
    
    const pow = () => ({
        require: [[mapFunc, ({ base, exp }) => Math.pow(base, exp)]]
    });
    
    let mw = instance().setDefault(callStack);
    
    let pow_ = mw.make(ref).setName('ref1');
    let num3_ = mw.make(ref).setName('ref2');
    let num4_ = mw.make(ref).setName('ref3');
    
    let _suma = mw.make(suma).setName('suma').
        append(mw.make(_const, 1).setName('const 1')).
        append(mw.make(_const, 2).setName('const 2'));
    
    expect(_suma.toString()).toBe('3');    
    
    _suma.append( 
        num3_.linkTo(mw.make(_var, 4).setName('var 1'))
    );
    
    console.log(_suma.getTracked());
    
    expect(num3_.toString()).toBe('4');
    expect(_suma.toString()).toBe('7');
    
    num3_.getLink().setValue(8);
    expect(num3_.toString()).toBe('8');
    expect(_suma.toString()).toBe('11');
    
    pow_.linkTo(
        mw.make(pow).
            setProp('base', mw.make(_const, 2)).
            setProp('exp', num4_.linkTo(mw.make(_var, 8)))
    );
    
    expect(pow_.toString()).toBe('256');
    
    num4_.getLink().setValue(10);
    expect(pow_.toString()).toBe('1024');
}