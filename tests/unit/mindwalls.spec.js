import { makeBuilder, reactive, _const, _var, ref, arrayFunc, mapFunc } from "../../src/mwcore/mindwalls.mjs";

describe('MindWalls basics', function () {
    test('check basic usage of mindwalls core', mainTest)
});

function mainTest() { 
    let builder = makeBuilder().loadForAll(reactive);
    
    let pow_ = builder.make(ref).setName('ref_pow');
    let num3_ = builder.make(ref).setName('ref_num3');
    let num4_ = builder.make(ref).setName('ref_num4');
    
    function suma() {
        this.load(arrayFunc, 
            builder.make(_const, (...nums) => nums.reduce((sum, curr) => sum + curr, 0)).setName('sumaFunc')
        );
    };

    let _suma = builder.make(suma).setName('suma').
        append(builder.make(_const, 1).setName('const 1')).
        append(builder.make(_const, 2).setName('const 2'));
    
    expect(_suma.toString()).toBe('3');
    
    _suma.append(
        num3_.linkTo(builder.make(_var, 4).setName('var 1'))
    );
    
    expect(num3_.toString()).toBe('4');
    expect(_suma.toString()).toBe('7');
      
    num3_.getTarget().setValue(8);
    expect(num3_.toString()).toBe('8');
    expect(_suma.toString()).toBe('11');

    _suma.remove(1);
    expect(_suma.toString()).toBe('9');

    //console.log(num3_.getTarget().getTrackers().map((x) => x.getName()));
    
    let powFunc = builder.make(_const, ({ base, exp }) => Math.pow(base, exp));

    pow_.linkTo(builder.make(mapFunc, powFunc).
        setProp('base', builder.make(_const, 2).setName('const 3')).
        setProp('exp', num4_.linkTo(builder.make(_var, 8).setName('var 2'))).
        setName("pow")
    );
    
    expect(pow_.toString()).toBe('256');
    
    num4_.getTarget().setValue(10);
    expect(pow_.toString()).toBe('1024');
}