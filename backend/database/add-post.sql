INSERT INTO posts (title, slug, tags, content, userid)
VALUES (
    'Test Post',
    'a1b2c3-test-post',
    ARRAY['Lifestyle'],
    'Mauris quis purus pretium, eleifend ligula nec, porta nisi. Praesent quis rhoncus tellus. Pellentesque faucibus eros at posuere accumsan. Nam a egestas ante. Mauris ut justo vel urna dictum malesuada. Phasellus sit amet sollicitudin lacus. Nullam malesuada odio eu elementum finibus. Praesent tincidunt dui eget arcu sollicitudin tempor. Praesent vel vestibulum dolor. Ut ut sem metus. In turpis tortor, tempor vitae quam sed, suscipit cursus est. Ut blandit et orci id imperdiet. Proin porta ex lacus, tristique posuere sem tempor sed.

Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla hendrerit ex id imperdiet aliquam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec suscipit velit id erat molestie, ut tempus elit posuere. Cras consectetur porta elit et faucibus. Fusce quis risus in magna sagittis convallis. Mauris hendrerit dui sed neque placerat, vel maximus nunc blandit. Ut arcu metus, commodo eu sapien non, blandit ultrices mi. Maecenas interdum leo eu efficitur pulvinar. Morbi ac elit ut odio sodales iaculis ut quis nibh. Aliquam ornare elementum magna sit amet bibendum. Donec vitae pellentesque nibh. Mauris vel pulvinar leo. Sed eu nibh sed enim congue tempus. Phasellus condimentum felis at magna pellentesque posuere. Etiam accumsan sapien laoreet dictum volutpat.

Ut consequat, lorem eget pharetra condimentum, leo dui auctor massa, at elementum risus risus vel ligula. Vivamus lobortis mi nec risus semper finibus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec ut sodales diam. Praesent malesuada lectus eget nunc aliquam iaculis. Donec rutrum velit quis facilisis malesuada. Sed commodo ipsum a est scelerisque feugiat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent pellentesque ipsum non ex rutrum, et rhoncus ex suscipit. Nullam sed est sit amet ante sagittis efficitur eu eleifend lorem.',
    (SELECT userid FROM users WHERE username = 'testuser')
);

INSERT INTO posts (title, slug, tags, content, userid)
VALUES (
    'Getting Started with Nutrition',
    'd4e5f6-getting-started-with-nutrition',
    ARRAY['Health Support'],
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl. Fusce tincidunt, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl. Curabitur at lectus at elit tincidunt tincidunt. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Proin vel ante a orci tempus eleifend ut et magna.

Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus. Phasellus ultrices nulla quis nibh. Quisque a lectus.

Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi. Nullam in massa. Suspendisse vitae nisl sit amet augue bibendum aliquam. Pellentesque sollicitudin tortor quis augue luctus, eget feugiat enim condimentum. Ut erat nibh, rhoncus nec ullamcorper vel, feugiat in metus. Integer eget leo sed diam fringilla interdum ac nec arcu. Nulla facilisi. Donec luctus sem non magna iaculis, a interdum risus imperdiet. Cras aliquet arcu vel tortor suscipit tristique.',
    (SELECT userid FROM users WHERE username = 'testuser')
);

INSERT INTO posts (title, slug, tags, content, userid)
VALUES (
    'The Benefits of Daily Exercise',
    'b7c8d9-the-benefits-of-daily-exercise',
    ARRAY['Lifestyle', 'Sleep & Recovery'],
    'Sed commodo posuere pede. Mauris ut est. Ut quis purus. Sed ac odio. Sed vehicula hendrerit sem. Duis non odio. Morbi ut dui. Sed accumsan risus eget odio. In hac habitasse platea dictumst. Pellentesque non elit. Fusce sed justo eu urna porta tincidunt. Mauris felis odio, sollicitudin sed, volutpat a, ornare ac, erat. Morbi quis dolor. Donec pellentesque, erat ac sagittis semper, nunc dui lobortis purus, quis congue purus metus ultricies tellus. Proin et quam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos.

Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus. Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi. Nullam in massa. Suspendisse vitae nisl sit amet augue bibendum aliquam. Pellentesque sollicitudin tortor quis augue luctus, eget feugiat enim condimentum.

Vivamus pretium ornare lacus, nec volutpat lorem fermentum vel. Integer finibus elit sed sapien ultricies, ac sagittis nulla tempor. Etiam convallis turpis quis velit sodales, non pretium nisi gravida. Donec consequat leo eu felis tincidunt, ut condimentum risus porta. Cras tincidunt est vel nulla malesuada, in faucibus leo efficitur. Sed id enim feugiat, iaculis felis nec, pretium purus. Nunc at felis a lacus convallis sodales. Sed in turpis a neque scelerisque dictum. Vivamus vel lacinia metus. Proin faucibus diam vel arcu auctor, nec pulvinar lorem varius.',
    (SELECT userid FROM users WHERE username = 'testuser')
);

INSERT INTO posts (title, slug, tags, content, userid)
VALUES (
    'Mindfulness and Mental Health',
    'e1f2a3-mindfulness-and-mental-health',
    ARRAY['Mindfulness', 'Health Support'],
    'Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.

Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante.

Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In ac dui quis mi consectetuer lacinia.',
    (SELECT userid FROM users WHERE username = 'testuser')
);

INSERT INTO posts (title, slug, tags, content, userid)
VALUES (
    'Building a Better Sleep Routine',
    'f3a4b5-building-a-better-sleep-routine',
    ARRAY['Sleep & Recovery', 'Lifestyle'],
    'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue.

In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.

Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue.',
    (SELECT userid FROM users WHERE username = 'katrina')
);

INSERT INTO posts (title, slug, tags, content, userid)
VALUES (
    'Understanding Anxiety and Finding Calm',
    'c6d7e8-understanding-anxiety-and-finding-calm',
    ARRAY['Mindfulness', 'Health Support'],
    'Fusce fermentum. Nullam varius nulla sed lacus. Pellentesque dapibus hendrerit tortor. Praesent egestas neque eu enim. In hac habitasse platea dictumst. Fusce a quam. Etiam ut purus mattis mauris sodales aliquam. Curabitur nisi. Quisque malesuada placerat nisl.

Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel, lacus. Sed augue ipsum, egestas nec, vestibulum et, malesuada adipiscing, dui. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pharetra congue enim arcu sodales scelerisque. Duis aliquam nisi a felis luctus, nec laoreet nisi pulvinar.

Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula. Fusce pharetra convallis urna. Quisque ut nisi. Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi. Suspendisse non nisl sit amet velit hendrerit rutrum. Proin pretium, leo ac pellentesque mollis, felis nunc ultrices eros.',
    (SELECT userid FROM users WHERE username = 'katrina')
);

INSERT INTO posts (title, slug, tags, content, userid)
VALUES (
    'Simple Habits for a Healthier Life',
    'b1c2d3-simple-habits-for-a-healthier-life',
    ARRAY['Lifestyle', 'Health Support'],
    'Sed molestie. Sed id ligula quis est convallis tempor. Curabitur lacinia pulvinar nibh. Nam a sapien. Vestibulum dapibus nunc ac augue. Curabitur vestibulum aliquam leo. Praesent egestas neque eu enim. In hac habitasse platea dictumst. Fusce a quam. Etiam ut purus mattis mauris sodales aliquam.

Curabitur nisi. Quisque malesuada placerat nisl. Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel, lacus. Sed augue ipsum, egestas nec, vestibulum et, malesuada adipiscing, dui. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pharetra congue enim arcu sodales scelerisque.

Phasellus magna. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.',
    (SELECT userid FROM users WHERE username = 'chantelle')
);

INSERT INTO posts (title, slug, tags, content, userid)
VALUES (
    'A Guide to Mindful Breathing',
    'e4f5a6-a-guide-to-mindful-breathing',
    ARRAY['Mindfulness'],
    'Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus. Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus.

Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi. Nullam in massa. Suspendisse vitae nisl sit amet augue bibendum aliquam. Pellentesque sollicitudin tortor quis augue luctus, eget feugiat enim condimentum. Ut erat nibh, rhoncus nec ullamcorper vel, feugiat in metus.

Integer eget leo sed diam fringilla interdum ac nec arcu. Nulla facilisi. Donec luctus sem non magna iaculis, a interdum risus imperdiet. Cras aliquet arcu vel tortor suscipit tristique. Vivamus pretium ornare lacus, nec volutpat lorem fermentum vel. Integer finibus elit sed sapien ultricies.',
    (SELECT userid FROM users WHERE username = 'chantelle')
);

INSERT INTO posts (title, slug, tags, content, userid)
VALUES (
    'Recovery Days: Why Rest Matters',
    'a7b8c9-recovery-days-why-rest-matters',
    ARRAY['Sleep & Recovery', 'Health Support'],
    'Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet.

Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem.

Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc.',
    (SELECT userid FROM users WHERE username = 'aman')
);

INSERT INTO posts (title, slug, tags, content, userid)
VALUES (
    'Staying Consistent with Your Wellness Goals',
    'd0e1f2-staying-consistent-with-your-wellness-goals',
    ARRAY['Lifestyle', 'Mindfulness'],
    'Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In ac dui quis mi consectetuer lacinia.

Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus.

Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci.',
    (SELECT userid FROM users WHERE username = 'aman')
);
